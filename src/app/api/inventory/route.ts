import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const medicines = await prisma.medicine.findMany({
      include: {
        inventoryItems: true,
      },
      orderBy: { name: "asc" },
    });

    const formatted = medicines.map((m) => {
      const totalStock = m.inventoryItems.reduce(
        (acc, curr) => acc + curr.quantityInStock,
        0
      );
      const isLowStock = totalStock <= m.reorderLevel;

      return {
        id: m.id,
        code: m.code,
        name: m.name,
        genericName: m.genericName,
        category: m.category,
        form: m.form,
        strength: m.strength,
        manufacturer: m.manufacturer,
        unitPrice: Number(m.unitPrice),
        reorderLevel: m.reorderLevel,
        totalStock,
        isLowStock,
        batches: m.inventoryItems.map((b) => ({
          id: b.id,
          batchNumber: b.batchNumber,
          expiryDate: b.expiryDate,
          quantityInStock: b.quantityInStock,
          sellingPrice: Number(b.sellingPrice),
          location: b.location,
          status: b.status,
        })),
      };
    });

    return NextResponse.json({ medicines: formatted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
