# Production Hospital Management System (HMS / ERP) - Entity-Relationship Diagram

This document presents the relational architecture of the **CarePulse Hospital Management System**.
The architecture improves upon the reference ER diagram by normalizing clinical, financial, and pharmaceutical entities into an enterprise-ready model.

---

## 1. Relational Architecture Diagram (Mermaid)

```mermaid
erDiagram
    User ||--o| Doctor : "doctorProfile"
    User ||--o| Staff : "staffProfile"
    User ||--o| Patient : "patientProfile"
    User ||--o{ Notification : "receives"
    User ||--o{ ActivityLog : "performs"
    User ||--o{ Payment : "cashierCollects"

    Role ||--|{ Permission : "grants"

    Department ||--|{ Doctor : "employs"
    Department ||--|{ Staff : "employs"
    Department ||--o{ Appointment : "hosts"

    Room ||--|{ Bed : "contains"
    Room ||--o{ Admission : "assigns"

    Patient ||--o| Bed : "occupies"
    Patient ||--o{ Admission : "admits"
    Patient ||--o{ Appointment : "books"
    Patient ||--o{ MedicalRecord : "possesses"
    Patient ||--o{ Prescription : "receives"
    Patient ||--o{ Bill : "billedTo"
    Patient ||--o{ LabRequest : "undergoes"
    Patient ||--o{ InsuranceClaim : "files"
    Patient ||--o{ Payment : "settles"

    Doctor ||--o{ Admission : "attends"
    Doctor ||--o{ Appointment : "consults"
    Doctor ||--o{ MedicalRecord : "creates"
    Doctor ||--o{ Prescription : "authorizes"
    Doctor ||--o{ LabRequest : "orders"

    Staff ||--o{ LabReport : "verifies"

    Bed ||--o{ Admission : "bedStay"

    Admission ||--o{ MedicalRecord : "inpatientRecords"
    Admission ||--o{ Prescription : "inpatientRx"
    Admission ||--o{ Bill : "inpatientBill"
    Admission ||--o{ LabRequest : "inpatientLabs"

    Appointment ||--o{ MedicalRecord : "outpatientRecord"
    Appointment ||--o{ Prescription : "outpatientRx"
    Appointment ||--o{ Bill : "outpatientBill"
    Appointment ||--o{ LabRequest : "outpatientLabs"

    MedicalRecord ||--|{ Diagnosis : "diagnoses"

    Medicine ||--|{ MedicineInventory : "batches"
    Medicine ||--o{ PrescriptionItem : "prescribed"
    Medicine ||--o{ BillItem : "billedItem"

    Prescription ||--|{ PrescriptionItem : "items"

    LabTest ||--o{ LabRequest : "orderedAs"
    LabRequest ||--o| LabReport : "produces"

    Bill ||--|{ BillItem : "contains"
    Bill ||--o| Invoice : "generates"
    Bill ||--o{ Payment : "receipts"
    Bill ||--o{ InsuranceClaim : "claims"
```

---

## 2. Key Architectural Enhancements Over Reference Diagram

| Baseline ER Diagram Feature | Production HMS ERP Enhancement | Why It Matters in Real Hospitals |
| :--- | :--- | :--- |
| Single flat `Staff` table with designations | Typed `User` with `Doctor` and `Staff` sub-entities + RBAC `Role`/`Permission` | Enables fine-grained security, license validation, and specific consultation fees. |
| Basic `Room` without bed tracking | Hierarchical `Room` (1) ➔ `Bed` (N) model with status flags (`OCCUPIED`, `CLEANING`, `MAINTENANCE`) | Real hospitals allocate specific beds inside multi-bed general wards and ICUs. |
| Inpatient / Outpatient split without common patient identity | Unified `Patient` (UHID) linked polymorphically to `Admission` and `Appointment` | Patients maintain a single lifetime clinical health record (EHR) across both OPD and IPD visits. |
| Generic Medicine string in bill | `Medicine` formulary catalog with `MedicineInventory` batch tracking & expiry dates | Enables FIFO batch deduction, prevents dispensing expired lots, and tracks unit costs. |
| Direct total price entry | Itemized `Bill` and `BillItem` with real-time balance calculations, multiple payment receipts (`Payment`), and printable `Invoice` | Supports partial payments, insurance TPA co-pays, itemized pharmacy bills, and accounting compliance. |
| Lack of Diagnostic Lab workflow | Dedicated `LabTest`, `LabRequest`, and pathologist-verified `LabReport` pipeline | Critical diagnostic loop connecting doctor orders to technician analysis and abnormal flag alerts. |
| No compliance audit trail | Automated `ActivityLog` and `Notification` engines | Full HIPAA/HL7-style auditable access logs for patient privacy and regulatory compliance. |
