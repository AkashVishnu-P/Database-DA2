# CarePulse Hospital Management System (HMS / ERP) - API Documentation

Comprehensive REST API reference for the Next.js 15 App Router route handlers.

---

## Base URL
`/api`

All requests transmitting JSON data should supply `Content-Type: application/json`.
Authenticated requests use HTTP-only secure cookie sessions (`hospital_session`) or `Authorization: Bearer <JWT>`.

---

## 1. Authentication & Session

### `POST /api/auth/login`
Authenticates hospital personnel or patients.
- **Request Body**:
  ```json
  {
    "email": "doctor@hospital.com",
    "password": "Hospital@123"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "user": {
      "id": "cuid...",
      "email": "doctor@hospital.com",
      "role": "DOCTOR",
      "firstName": "Marcus",
      "lastName": "House"
    }
  }
  ```

### `POST /api/auth/logout`
Clears session cookies and terminates session.

### `GET /api/auth/me`
Retrieves currently authenticated user profile and associated role entity IDs.

### `POST /api/auth/switch-role`
Testing helper allowing instant switching between any of the 9 demo user roles.
- **Request Body**:
  ```json
  {
    "role": "CASHIER"
  }
  ```

---

## 2. Patients & Registration

### `GET /api/patients`
Retrieves paginated patient directory with search queries.
- **Query Parameters**:
  - `query` (optional): Filter by UHID, first name, last name, or emergency contact.
  - `page` (optional, default: 1): Page number.
  - `limit` (optional, default: 50): Page limit.

### `POST /api/patients`
Registers a new patient and assigns auto-incrementing Unique Hospital Identifier (`UHID-2026-XXXX`).
- **Request Body**:
  ```json
  {
    "firstName": "Eleanor",
    "lastName": "Pond",
    "phone": "+1 555-0192",
    "gender": "Female",
    "dateOfBirth": "1994-08-12",
    "bloodGroup": "O+",
    "allergies": "Penicillin",
    "chronicConditions": "Asthma"
  }
  ```

---

## 3. Outpatient Appointments & OPD Queue

### `GET /api/appointments`
Retrieves appointment roster with filter parameters.
- **Query Parameters**:
  - `date`: Filter by calendar date (`YYYY-MM-DD`).
  - `doctorId`: Attending doctor ID.
  - `patientId`: Patient ID.
  - `status`: `SCHEDULED`, `IN_CONSULTATION`, `COMPLETED`.

### `POST /api/appointments`
Schedules an appointment, generates sequential daily token number, and creates OPD billing charges.
- **Request Body**:
  ```json
  {
    "patientId": "cuid...",
    "doctorId": "cuid...",
    "departmentId": "cuid...",
    "appointmentDate": "2026-10-10",
    "timeSlot": "10:30 AM",
    "type": "OUTPATIENT",
    "priority": "NORMAL"
  }
  ```

---

## 4. Inpatient Admissions & Bed Management

### `GET /api/admissions`
Lists active inpatients and completed discharges.
- **Query Parameters**:
  - `status`: `ADMITTED`, `DISCHARGED`.

### `POST /api/admissions`
Admit patient into ward bed with ACID transaction:
1. Validates bed availability.
2. Updates `Bed.isOccupied = true`.
3. Increments `Room.occupiedBeds`.
4. Creates Inpatient Bill with initial admission fee.
5. Emits notification to attending doctor.
- **Request Body**:
  ```json
  {
    "patientId": "cuid...",
    "doctorId": "cuid...",
    "roomId": "cuid...",
    "bedId": "cuid...",
    "admissionType": "ELECTIVE",
    "diagnosisAtAdmission": "Acute abdominal pain under observation"
  }
  ```

### `POST /api/admissions/discharge`
Executes clinical discharge:
1. Sets `Admission.status = DISCHARGED` with summary.
2. Frees bed (`isOccupied = false`, `status = CLEANING`).
3. Decrements `Room.occupiedBeds`.
4. Calculates duration of stay and computes total room daily charges into patient bill.
- **Request Body**:
  ```json
  {
    "admissionId": "cuid...",
    "dischargeDoctorId": "cuid...",
    "dischargeSummary": "Patient stabilized and discharged on oral meds."
  }
  ```

### `GET /api/beds`
Returns real-time ward bed board with room classification (ICU, Private, General, OT) and occupancy status.

---

## 5. Pharmacy & Prescriptions

### `GET /api/prescriptions`
Returns active and dispensed clinical prescriptions.

### `POST /api/prescriptions`
Doctor writes digital prescription with itemized drug formulations, dosages, and frequency.

### `POST /api/prescriptions/dispense`
Pharmacist executes dispensation:
1. Atomically decrements `MedicineInventory.quantityInStock`.
2. Marks `PrescriptionItem.isDispensed = true` and `Prescription.status = DISPENSED`.
3. Auto-generates pharmacy bill with drug totals.
- **Request Body**:
  ```json
  {
    "prescriptionId": "cuid..."
  }
  ```

### `GET /api/inventory`
Returns formulary medicines, batch numbers, expiration dates, shelf locations, and reorder levels.

---

## 6. Billing & POS Payments

### `GET /api/billing`
Returns ledger of invoices across Inpatient, Outpatient, Pharmacy, and Diagnostic streams.

### `POST /api/billing/pay`
Collects payment at cashier desk:
1. Generates receipt number (`RCP-2026-XXXXX`).
2. Atomically increases `Bill.paidAmount` and decreases `Bill.balanceAmount`.
3. Updates `Bill.paymentStatus` (`PAID` or `PARTIALLY_PAID`).
4. Generates or updates formal `Invoice`.
- **Request Body**:
  ```json
  {
    "billId": "cuid...",
    "amount": 250.00,
    "paymentMethod": "CREDIT_CARD",
    "transactionRef": "TXN-98412"
  }
  ```

---

## 7. Laboratory & Diagnostics

### `GET /api/lab`
Returns lab tests catalog and test requests pipeline.

### `POST /api/lab`
- **Action Order Test**:
  ```json
  {
    "patientId": "cuid...",
    "labTestId": "cuid...",
    "priority": "URGENT"
  }
  ```
- **Action Complete Findings**:
  ```json
  {
    "action": "COMPLETE_REPORT",
    "labRequestId": "cuid...",
    "results": { "wbc": "6.5", "rbc": "4.8" },
    "remarks": "Normal counts",
    "isAbnormal": false
  }
  ```

---

## 8. Analytics & Operational Telemetry

### `GET /api/analytics`
Aggregates live KPIs:
- `kpis.totalPatients`, `kpis.todayAppointments`, `kpis.activeAdmissions`
- `kpis.occupiedBeds`, `kpis.bedOccupancyRate`
- `kpis.todayRevenue`, `kpis.totalRevenue`, `kpis.pendingBillsAmount`
- `charts.monthlyRevenue` dataset for Recharts area visualization
- `charts.departmentDistribution` dataset for Recharts bar visualization
- `recentActivities` audit trail log entries
