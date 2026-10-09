import prisma from "@/lib/prisma";
import { PrescriptionStatus, InventoryStatus } from "@prisma/client";

export class PharmacyService {
  /**
   * Dispenses prescription medications:
   * 1. Finds active stock batches in MedicineInventory
   * 2. Decrements quantityInStock atomically
   * 3. Sets inventory status to LOW_STOCK / OUT_OF_STOCK if threshold met
   * 4. Updates PrescriptionItem.isDispensed = true
   * 5. Sets Prescription.status = DISPENSED
   * 6. Creates a pharmacy Bill or appends to patient bill
   * 7. Records audit activity log
   */
  static async dispensePrescription(prescriptionId: string, pharmacistUserId?: string) {
    return prisma.$transaction(async (tx) => {
      const prescription = await tx.prescription.findUnique({
        where: { id: prescriptionId },
        include: {
          items: { include: { medicine: true } },
          patient: true,
          admission: true,
        },
      });

      if (!prescription) throw new Error("Prescription not found.");
      if (prescription.status === PrescriptionStatus.DISPENSED) {
        throw new Error("Prescription has already been dispensed.");
      }

      let totalPharmacyCost = 0;
      const billItemsData: Array<{
        medicineId: string;
        description: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
      }> = [];

      for (const item of prescription.items) {
        if (item.isDispensed) continue;

        // Find available batch for this medicine
        const batch = await tx.medicineInventory.findFirst({
          where: {
            medicineId: item.medicineId,
            quantityInStock: { gt: 0 },
            expiryDate: { gt: new Date() },
          },
          orderBy: { expiryDate: "asc" }, // FIFO by expiry
        });

        const qtyNeeded = Math.max(1, item.durationDays * 2); // Standard dispensation calculation

        if (batch) {
          const deductQty = Math.min(batch.quantityInStock, qtyNeeded);
          const newQty = batch.quantityInStock - deductQty;

          await tx.medicineInventory.update({
            where: { id: batch.id },
            data: {
              quantityInStock: newQty,
              status:
                newQty === 0
                  ? InventoryStatus.OUT_OF_STOCK
                  : newQty <= item.medicine.reorderLevel
                  ? InventoryStatus.LOW_STOCK
                  : InventoryStatus.IN_STOCK,
            },
          });
        }

        const unitPrice = Number(item.medicine.unitPrice);
        const itemTotal = unitPrice * qtyNeeded;
        totalPharmacyCost += itemTotal;

        billItemsData.push({
          medicineId: item.medicineId,
          description: `${item.medicineName} (${item.dosage}, ${item.frequency})`,
          quantity: qtyNeeded,
          unitPrice,
          totalPrice: itemTotal,
        });

        // Mark item dispensed
        await tx.prescriptionItem.update({
          where: { id: item.id },
          data: { isDispensed: true },
        });
      }

      // Mark prescription dispensed
      await tx.prescription.update({
        where: { id: prescription.id },
        data: { status: PrescriptionStatus.DISPENSED },
      });

      // Generate pharmacy bill
      const billCount = await tx.bill.count();
      const year = new Date().getFullYear();
      const billNumber = `RXB-${year}-${String(billCount + 1).padStart(5, "0")}`;

      const pharmacyBill = await tx.bill.create({
        data: {
          billNumber,
          patientId: prescription.patientId,
          admissionId: prescription.admissionId || null,
          appointmentId: prescription.appointmentId || null,
          billType: "PHARMACY",
          totalAmount: totalPharmacyCost,
          netAmount: totalPharmacyCost,
          paidAmount: 0.0,
          balanceAmount: totalPharmacyCost,
          paymentStatus: "PENDING",
          items: {
            create: billItemsData.map((b) => ({
              medicineId: b.medicineId,
              description: b.description,
              quantity: b.quantity,
              unitPrice: b.unitPrice,
              totalPrice: b.totalPrice,
            })),
          },
        },
      });

      // Activity log
      await tx.activityLog.create({
        data: {
          userId: pharmacistUserId || null,
          action: "PRESCRIPTION_DISPENSED",
          entityType: "Prescription",
          entityId: prescription.id,
          detailsJson: JSON.stringify({
            prescriptionNumber: prescription.prescriptionNumber,
            totalPharmacyCost,
            itemsCount: billItemsData.length,
          }),
        },
      });

      return { prescription, pharmacyBill };
    });
  }
}
