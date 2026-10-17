# CarePulse Hospital Management System (HMS / ERP)

A commercial-grade, multi-role Hospital Information System (HIS / ERP) engineered with **Next.js 15 (App Router)**, **TypeScript**, **Prisma ORM**, **MySQL**, **Tailwind CSS**, and **Recharts**.

Designed to mirror the workflows and clinical precision of enterprise hospital software such as **Epic Systems**, **Cerner**, and **Athenahealth**.

---

## 🌟 Key Features & Clinical Capabilities

### 1. 9 Tailored Role Portals & RBAC
- **Super Admin**: Full master provisioning, security permission matrix, system health, and SQL database backups.
- **Hospital Administrator**: Executive dashboard, inpatient census, departmental load, and financial analytics.
- **Doctor / Physician**: OPD consultation queue caller, inpatient ward rounds, digital prescription composer, and lab test order dispatch.
- **Receptionist / Intake**: Fast patient registration with automated **UHID** generation, OPD appointment scheduling, and live token ticketing.
- **Nurse / Ward Station**: Interactive ward Bed Board (ICU, Private, General Wards), patient telemetry, and vitals recording.
- **Cashier / POS Desk**: Point-of-Sale settlement console, multi-gateway payment collection (Cash, Card, UPI, Insurance), and printable tax invoices.
- **Pharmacist / Formulary**: Prescription dispensing pipeline with atomic inventory decrement, batch expiration tracking, and low-stock alerts.
- **Lab Technician / Pathology**: Diagnostic order queue, clinical findings entry with reference range validation, and report approval.
- **Patient Health Portal**: Personal records, scheduled appointments, active digital prescriptions, verified lab reports, and billing statements.

---

## ⚡ Automated Database Lifecycle & Business Triggers

All clinical workflows execute inside atomic ACID transactions (`prisma.$transaction`):

1. **Patient Admission**:
   - Updates `Bed.isOccupied = true` and `Bed.status = OCCUPIED`.
   - Increments `Room.occupiedBeds`.
   - Auto-generates initial Inpatient Bill with admission reservation fee.
   - Emits alerts to attending doctor and ward nurse.
   - Writes immutable entry to `ActivityLog`.

2. **Patient Discharge**:
   - Marks `Admission.status = DISCHARGED` with physician discharge summary.
   - Releases `Bed` (`isOccupied = false`, `status = CLEANING`).
   - Decrements `Room.occupiedBeds`.
   - Calculates duration of stay (days) and computes room daily charges into patient bill.
   - Finalizes invoice balance for cashier settlement.

3. **Prescription Dispensing**:
   - Pharmacist dispenses items ➔ decrements `MedicineInventory.quantityInStock` for matching lots.
   - Marks items `isDispensed = true` and `Prescription.status = DISPENSED`.
   - Generates pharmacy billing statement and alerts if stock falls below `reorderLevel`.

4. **Appointment Scheduling**:
   - Calculates sequential daily queue `tokenNumber`.
   - Appends doctor consultation fee to outpatient billing queue.
   - Notifies attending physician.

5. **Payment Collection**:
   - Records payment transaction with unique receipt number (`RCP-2026-XXXXX`).
   - Atomically updates `Bill.paidAmount` and `Bill.balanceAmount`.
   - Flips `Bill.paymentStatus` to `PAID` or `PARTIALLY_PAID`.
   - Generates official tax invoice with printable thermal/A4 receipt.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Shadcn UI primitives, Framer Motion, TanStack Query, Recharts, Lucide React, Sonner toasts, `next-themes` (Dark/Light).
- **Backend**: Next.js Route Handlers (`/api/*`), domain-driven service layer with transactional isolation.
- **Database**: MySQL 8.0+ with normalized relational schema, foreign key constraints, and performance indexes.
- **Authentication**: JWT session cookies, `bcryptjs` password hashing, and role-based route middleware.
- **Reports & Export**: Built-in support for printing official tax invoices and receipts.

---

## 🔐 Demo Credentials (All Roles)

Every role has a pre-configured demo account with password: `Hospital@123`

| Role | Email Address | Password |
| :--- | :--- | :--- |
| **Super Admin** | `admin@hospital.com` | `Hospital@123` |
| **Hospital Administrator** | `hospital.admin@hospital.com` | `Hospital@123` |
| **Doctor** | `doctor@hospital.com` | `Hospital@123` |
| **Receptionist** | `receptionist@hospital.com` | `Hospital@123` |
| **Nurse** | `nurse@hospital.com` | `Hospital@123` |
| **Cashier** | `cashier@hospital.com` | `Hospital@123` |
| **Lab Technician** | `lab@hospital.com` | `Hospital@123` |
| **Pharmacist** | `pharmacist@hospital.com` | `Hospital@123` |
| **Patient** | `patient@hospital.com` | `Hospital@123` |

> 💡 **Quick Switcher**: Once logged in, click the **Role Badge** in the top navigation bar to switch between any of the 9 roles with 1 click!

---

## 📦 Realistic Seed Dataset Included

The automated seed script populates over **1,000 interconnected records**:
- **10 Clinical Departments** (Cardiology, Neurology, Orthopedics, Pediatrics, Oncology, OB/GYN, Emergency, etc.)
- **30 Certified Doctors** with specialties, schedules, and consultation fees.
- **40 Healthcare Staff Members** (Nurses, Receptionists, Cashiers, Pharmacists, Lab Techs).
- **50 Hospital Rooms & 150 Ward Beds** (ICU, Private, Semi-Private, General Wards).
- **100 Patients** with authentic medical histories, allergies, and unique UHIDs (`UHID-2026-XXXX`).
- **300 Outpatient Appointments** with daily queue tokens.
- **100 Inpatient Admissions** (both active census and discharged cases).
- **100 Digital Prescriptions** with multi-drug dosing schedules.
- **60 Formulary Medicines** with batch inventory lots, expiry dates, and shelf locations.
- **40 Diagnostic Lab Requests & Verified Pathology Reports**.
- **200 Invoices, Bills, and Payment Receipts**.

---

## 🚀 Installation & Local Setup

### 1. Prerequisites
- Node.js 18+ (tested on Node 20 / 22 / 24)
- MySQL Server 8.0+ running locally on port `3306`

### 2. Configure Database
In your MySQL instance, create the database:
```sql
CREATE DATABASE IF NOT EXISTS DBMS_PROJECT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Verify your `.env` configuration:
```env
DATABASE_URL="mysql://root@127.0.0.1:3306/DBMS_PROJECT"
JWT_SECRET="hospital_erp_super_secret_jwt_key_2026_production_quality"
```

### 3. Push Schema to MySQL
```bash
npx prisma db push
```

### 4. Seed Realistic Dataset (optional, wipes existing rows)
```bash
npm run db:seed
```

### 5. Install the PL/SQL Routines
```bash
mysql -u root DBMS_PROJECT < sql/plsql.sql
```

### 6. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📄 Deliverables Summary

1. **Next.js 15 Project Source**: Complete clean architecture in `src/`
2. **Prisma Schema**: `prisma/schema.prisma`
3. **SQL Folder** (`sql/`):
   - `schema.sql`: all tables, generated from the Prisma schema
   - `sample_data.sql`: a few rows for practicing queries
   - `easy_queries.sql`: simple SELECT, WHERE, ORDER BY, GROUP BY, JOIN, subquery, INSERT/UPDATE/DELETE and views
   - `plsql.sql`: simple stored procedures, functions, a cursor, loops and triggers (MySQL stored-program syntax, the MySQL equivalent of PL/SQL)
4. **Seed Script**: `prisma/seed.ts` (populating 1000+ realistic records)
5. **Entity Relationship Diagram**: `ER_DIAGRAM.md`
6. **REST API Documentation**: `API_DOCS.md`
