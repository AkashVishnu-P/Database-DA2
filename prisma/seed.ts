import { PrismaClient, UserRole, UserStatus, DoctorStatus, StaffShift, RoomType, RoomStatus, BedStatus, AdmissionStatus, AdmissionType, AppointmentStatus, AppointmentType, PriorityLevel, MedicineForm, InventoryStatus, PrescriptionStatus, ServiceCategory, LabRequestStatus, BillType, PaymentStatus, PaymentMethod } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const FIRST_NAMES = [
  "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth",
  "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen",
  "Christopher", "Nancy", "Daniel", "Lisa", "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra",
  "Donald", "Ashley", "Steven", "Kimberly", "Paul", "Emily", "Andrew", "Donna", "Joshua", "Michelle",
  "Kenneth", "Dorothy", "Kevin", "Carol", "Brian", "Amanda", "George", "Melissa", "Edward", "Deborah",
  "Ronald", "Stephanie", "Timothy", "Rebecca", "Jason", "Sharon", "Jeffrey", "Laura", "Ryan", "Cynthia",
  "Jacob", "Kathleen", "Gary", "Amy", "Nicholas", "Shirley", "Eric", "Angela", "Jonathan", "Helen",
  "Stephen", "Anna", "Larry", "Brenda", "Justin", "Pamela", "Scott", "Nicole", "Brandon", "Emma",
  "Benjamin", "Samantha", "Samuel", "Katherine", "Gregory", "Christine", "Alexander", "Debra", "Patrick", "Rachel",
  "Frank", "Catherine", "Raymond", "Carolyn", "Jack", "Janet", "Dennis", "Ruth", "Jerry", "Maria"
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
  "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
  "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
  "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
  "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts"
];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const CITIES = ["New York", "Chicago", "Boston", "Seattle", "Austin", "Denver", "Atlanta", "San Francisco"];
const INSURANCE_PROVIDERS = ["Blue Cross Blue Shield", "Aetna Health", "UnitedHealthcare", "Cigna", "Kaiser Permanente", "Humana"];

const DEPARTMENTS_DATA = [
  { name: "General Medicine", code: "GMED", floor: "1st Floor", contact: "ext-101", desc: "Primary care, internal medicine, and acute adult care." },
  { name: "Cardiology", code: "CARD", floor: "2nd Floor", contact: "ext-102", desc: "Comprehensive cardiac diagnostics, catheterization, and post-op care." },
  { name: "Neurology", code: "NEUR", floor: "3rd Floor", contact: "ext-103", desc: "Specialized neurological disorders, stroke center, and EEG monitoring." },
  { name: "Orthopedics", code: "ORTH", floor: "2nd Floor", contact: "ext-104", desc: "Musculoskeletal trauma, joint replacement, and sports medicine." },
  { name: "Pediatrics", code: "PEDI", floor: "1st Floor", contact: "ext-105", desc: "Infant, child, and adolescent healthcare and neonatal ICU." },
  { name: "Oncology", code: "ONCO", floor: "4th Floor", contact: "ext-106", desc: "Medical oncology, infusion suite, and radiation therapy." },
  { name: "Obstetrics & Gynecology", code: "OBGY", floor: "3rd Floor", contact: "ext-107", desc: "Maternal-fetal medicine, labor & delivery, and women's health." },
  { name: "Emergency Medicine", code: "EMER", floor: "Ground Floor", contact: "ext-911", desc: "24/7 Level-1 trauma response, resuscitation, and critical stabilization." },
  { name: "Dermatology", code: "DERM", floor: "2nd Floor", contact: "ext-108", desc: "Skin disorders, biopsies, and phototherapy." },
  { name: "Pathology & Laboratory", code: "PATH", floor: "Basement 1", contact: "ext-109", desc: "High-complexity automated diagnostics, blood bank, and histology." },
];

const MEDICINES_DATA = [
  { code: "MED-001", name: "Amoxicillin", genericName: "Amoxicillin Trihydrate", category: "Antibiotic", form: MedicineForm.CAPSULE, strength: "500mg", manufacturer: "Pfizer", price: 12.50, stock: 450 },
  { code: "MED-002", name: "Paracetamol", genericName: "Acetaminophen", category: "Analgesic / Antipyretic", form: MedicineForm.TABLET, strength: "650mg", manufacturer: "GSK", price: 4.00, stock: 1200 },
  { code: "MED-003", name: "Ibuprofen", genericName: "Ibuprofen", category: "NSAID", form: MedicineForm.TABLET, strength: "400mg", manufacturer: "Abbott", price: 8.00, stock: 800 },
  { code: "MED-004", name: "Metformin", genericName: "Metformin HCl", category: "Antidiabetic", form: MedicineForm.TABLET, strength: "850mg", manufacturer: "Merck", price: 15.00, stock: 600 },
  { code: "MED-005", name: "Atorvastatin", genericName: "Atorvastatin Calcium", category: "Statin / Lipid Lowering", form: MedicineForm.TABLET, strength: "20mg", manufacturer: "Pfizer", price: 22.00, stock: 520 },
  { code: "MED-006", name: "Amlodipine", genericName: "Amlodipine Besylate", category: "Antihypertensive", form: MedicineForm.TABLET, strength: "5mg", manufacturer: "Novartis", price: 10.00, stock: 650 },
  { code: "MED-007", name: "Omeprazole", genericName: "Omeprazole", category: "Proton Pump Inhibitor", form: MedicineForm.CAPSULE, strength: "20mg", manufacturer: "AstraZeneca", price: 14.00, stock: 700 },
  { code: "MED-008", name: "Azithromycin", genericName: "Azithromycin Dihydrate", category: "Macrolide Antibiotic", form: MedicineForm.TABLET, strength: "500mg", manufacturer: "Teva", price: 28.00, stock: 350 },
  { code: "MED-009", name: "Ceftriaxone", genericName: "Ceftriaxone Sodium", category: "Cephalosporin Antibiotic", form: MedicineForm.INJECTION, strength: "1g Vial", manufacturer: "Roche", price: 45.00, stock: 180 },
  { code: "MED-010", name: "Salbutamol Inhaler", genericName: "Albuterol Sulfate", category: "Bronchodilator", form: MedicineForm.INHALER, strength: "100mcg/dose", manufacturer: "GSK", price: 35.00, stock: 140 },
  { code: "MED-011", name: "Cough Relief Syrup", genericName: "Dextromethorphan HBr", category: "Antitussive", form: MedicineForm.SYRUP, strength: "100ml", manufacturer: "Johnson & Johnson", price: 9.50, stock: 220 },
  { code: "MED-012", name: "Hydrocortisone Cream", genericName: "Hydrocortisone", category: "Topical Corticosteroid", form: MedicineForm.OINTMENT, strength: "1% 30g", manufacturer: "Bayer", price: 16.00, stock: 160 },
  { code: "MED-013", name: "Ciprofloxacin Eye Drops", genericName: "Ciprofloxacin 0.3%", category: "Ophthalmic Antibiotic", form: MedicineForm.DROPS, strength: "5ml", manufacturer: "Alcon", price: 18.50, stock: 190 },
  { code: "MED-014", name: "Insulin Glargine", genericName: "Insulin Glargine", category: "Long-acting Insulin", form: MedicineForm.INJECTION, strength: "100 IU/ml 3ml", manufacturer: "Sanofi", price: 85.00, stock: 90 },
  { code: "MED-015", name: "Pantoprazole", genericName: "Pantoprazole Sodium", category: "Antacid / PPI", form: MedicineForm.TABLET, strength: "40mg", manufacturer: "Takeda", price: 12.00, stock: 500 },
];

const LAB_TESTS_DATA = [
  { code: "LAB-CBC", name: "Complete Blood Count (CBC)", category: "Hematology", fee: 40.0, range: "WBC: 4.5-11.0, RBC: 4.2-5.9, Plt: 150-450", unit: "k/uL" },
  { code: "LAB-LIPID", name: "Lipid Profile Panel", category: "Biochemistry", fee: 65.0, range: "Cholesterol < 200, LDL < 100, HDL > 50", unit: "mg/dL" },
  { code: "LAB-LFT", name: "Liver Function Test (LFT)", category: "Biochemistry", fee: 75.0, range: "ALT: 7-56, AST: 10-40, Bilirubin: 0.1-1.2", unit: "U/L" },
  { code: "LAB-KFT", name: "Kidney Function Test / BUN & Creatinine", category: "Biochemistry", fee: 60.0, range: "Creatinine: 0.7-1.3, BUN: 7-20", unit: "mg/dL" },
  { code: "LAB-HBA1C", name: "Hemoglobin A1c (HbA1c)", category: "Endocrinology", fee: 55.0, range: "< 5.7% Normal, 5.7-6.4% Prediabetes", unit: "%" },
  { code: "LAB-XRAY-CHEST", name: "Chest X-Ray (PA View)", category: "Radiology", fee: 90.0, range: "Clear lung fields, normal cardiothoracic ratio", unit: "Visual" },
  { code: "LAB-ECG", name: "12-Lead Electrocardiogram (ECG)", category: "Cardiology", fee: 50.0, range: "Normal Sinus Rhythm, 60-100 bpm", unit: "BPM" },
  { code: "LAB-URINE", name: "Urinalysis Routine & Microscopy", category: "Pathology", fee: 35.0, range: "Color: Pale Yellow, pH: 5.5-7.5, Protein: Neg", unit: "Standard" },
  { code: "LAB-THYROID", name: "Thyroid Panel (TSH, Free T3, Free T4)", category: "Endocrinology", fee: 80.0, range: "TSH: 0.4-4.0 mIU/L", unit: "mIU/L" },
  { code: "LAB-ECHO", name: "Echocardiogram (2D Echo)", category: "Cardiology", fee: 250.0, range: "Ejection Fraction 55-70%, No valvular lesion", unit: "%" },
];

async function main() {
  console.log("🚀 Starting Production Hospital Management System Seed Script...");

  const defaultPasswordHash = await bcrypt.hash("Hospital@123", 10);

  console.log("🧹 Cleaning up old tables...");
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.insuranceClaim.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.billItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.bill.deleteMany();
  await prisma.labReport.deleteMany();
  await prisma.labRequest.deleteMany();
  await prisma.labTest.deleteMany();
  await prisma.prescriptionItem.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.medicineInventory.deleteMany();
  await prisma.medicine.deleteMany();
  await prisma.service.deleteMany();
  await prisma.diagnosis.deleteMany();
  await prisma.medicalRecord.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.admission.deleteMany();
  await prisma.bed.deleteMany();
  await prisma.room.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.department.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.user.deleteMany();

  console.log("🏢 Seeding 10 Departments...");
  const departments: any[] = [];
  for (const dept of DEPARTMENTS_DATA) {
    const d = await prisma.department.create({
      data: {
        name: dept.name,
        code: dept.code,
        floor: dept.floor,
        contactNumber: dept.contact,
        description: dept.desc,
      },
    });
    departments.push(d);
  }

  console.log("🛡️ Seeding Roles and RBAC Permissions...");
  const roleNames = [
    UserRole.SUPER_ADMIN,
    UserRole.HOSPITAL_ADMIN,
    UserRole.DOCTOR,
    UserRole.RECEPTIONIST,
    UserRole.NURSE,
    UserRole.CASHIER,
    UserRole.LAB_TECHNICIAN,
    UserRole.PHARMACIST,
    UserRole.PATIENT,
  ];

  for (const rName of roleNames) {
    const roleRecord = await prisma.role.create({
      data: {
        name: rName,
        description: `Full access profile for ${rName}`,
      },
    });

    const modules = ["PATIENTS", "DOCTORS", "APPOINTMENTS", "ADMISSIONS", "BILLING", "PHARMACY", "LAB", "SETTINGS"];
    for (const mod of modules) {
      await prisma.permission.create({
        data: {
          roleId: roleRecord.id,
          module: mod,
          action: "ALL",
        },
      });
    }
  }

  console.log("🔑 Creating standard demo users for all 9 roles (Password: Hospital@123)...");
  const demoUsersConfig = [
    { email: "admin@hospital.com", role: UserRole.SUPER_ADMIN, firstName: "Alexander", lastName: "Vance" },
    { email: "hospital.admin@hospital.com", role: UserRole.HOSPITAL_ADMIN, firstName: "Eleanor", lastName: "Rigby" },
    { email: "doctor@hospital.com", role: UserRole.DOCTOR, firstName: "Marcus", lastName: "House" },
    { email: "receptionist@hospital.com", role: UserRole.RECEPTIONIST, firstName: "Chloe", lastName: "Bennett" },
    { email: "nurse@hospital.com", role: UserRole.NURSE, firstName: "Florence", lastName: "Nightingale" },
    { email: "cashier@hospital.com", role: UserRole.CASHIER, firstName: "Oliver", lastName: "Penn" },
    { email: "lab@hospital.com", role: UserRole.LAB_TECHNICIAN, firstName: "Walter", lastName: "Bishop" },
    { email: "pharmacist@hospital.com", role: UserRole.PHARMACIST, firstName: "Abigail", lastName: "Curie" },
    { email: "patient@hospital.com", role: UserRole.PATIENT, firstName: "Jonathan", lastName: "Doe" },
  ];

  const demoUsers: Record<string, any> = {};
  for (const du of demoUsersConfig) {
    const createdUser = await prisma.user.create({
      data: {
        email: du.email,
        passwordHash: defaultPasswordHash,
        role: du.role,
        firstName: du.firstName,
        lastName: du.lastName,
        phone: "+1 (555) 019-2831",
        status: UserStatus.ACTIVE,
      },
    });
    demoUsers[du.role] = createdUser;
  }

  console.log("👨‍⚕️ Seeding 30 Doctors across departments...");
  const doctors: any[] = [];
  const doctorSpecializations = [
    "Interventional Cardiology", "Cardiovascular Surgeon", "Pediatric Neurologist",
    "Clinical Neurologist", "Orthopedic Surgeon", "Joint Replacement Specialist",
    "General Physician", "Internal Medicine Consultant", "Pediatrician",
    "Neonatologist", "Medical Oncologist", "Surgical Oncologist",
    "Obstetrician & Gynecologist", "Trauma Surgeon", "Emergency Consultant",
    "Dermatologist", "Cosmetic Dermatologist", "Hematopathologist"
  ];

  for (let i = 0; i < 30; i++) {
    const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
    const lastName = LAST_NAMES[i % LAST_NAMES.length];
    const dept = departments[i % departments.length];
    const spec = doctorSpecializations[i % doctorSpecializations.length];

    let user;
    if (i === 0) {
      user = demoUsers[UserRole.DOCTOR];
    } else {
      user = await prisma.user.create({
        data: {
          email: `doctor.${firstName.toLowerCase()}.${lastName.toLowerCase()}.${i}@hospital.com`,
          passwordHash: defaultPasswordHash,
          role: UserRole.DOCTOR,
          firstName,
          lastName,
          phone: `+1 (555) 200-${String(i).padStart(4, "0")}`,
          status: UserStatus.ACTIVE,
        },
      });
    }

    const doc = await prisma.doctor.create({
      data: {
        userId: user.id,
        departmentId: dept.id,
        licenseNumber: `MD-LIC-${2015 + (i % 8)}-${String(i + 100).padStart(4, "0")}`,
        specialization: spec,
        qualification: "MBBS, MD, FACS, Board Certified",
        experienceYears: 6 + (i % 20),
        consultationFee: 75 + (i % 5) * 25,
        roomNumber: `Consultation Suite ${101 + i}`,
        status: i % 7 === 0 ? DoctorStatus.IN_CONSULTATION : DoctorStatus.AVAILABLE,
        scheduleJson: JSON.stringify({
          days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          hours: "09:00 AM - 04:00 PM",
        }),
      },
      include: { user: true, department: true },
    });
    doctors.push(doc);
  }

  console.log("👥 Seeding 40 Staff Members...");
  const staffMembers: any[] = [];
  const staffRoles = [
    { role: UserRole.NURSE, designation: "Senior Staff Nurse", deptCode: "GMED" },
    { role: UserRole.RECEPTIONIST, designation: "Patient Registration Executive", deptCode: "GMED" },
    { role: UserRole.CASHIER, designation: "Billing & Accounts Officer", deptCode: "GMED" },
    { role: UserRole.LAB_TECHNICIAN, designation: "Diagnostic Specialist", deptCode: "PATH" },
    { role: UserRole.PHARMACIST, designation: "Clinical Pharmacist", deptCode: "GMED" },
    { role: UserRole.HOSPITAL_ADMIN, designation: "Operations Director", deptCode: "GMED" },
  ];

  for (let i = 0; i < 40; i++) {
    const firstName = FIRST_NAMES[(i + 30) % FIRST_NAMES.length];
    const lastName = LAST_NAMES[(i + 15) % LAST_NAMES.length];
    const roleCfg = staffRoles[i % staffRoles.length];
    const dept = departments.find(d => d.code === roleCfg.deptCode) || departments[0];

    let user;
    if (i === 0) user = demoUsers[UserRole.NURSE];
    else if (i === 1) user = demoUsers[UserRole.RECEPTIONIST];
    else if (i === 2) user = demoUsers[UserRole.CASHIER];
    else if (i === 3) user = demoUsers[UserRole.LAB_TECHNICIAN];
    else if (i === 4) user = demoUsers[UserRole.PHARMACIST];
    else if (i === 5) user = demoUsers[UserRole.HOSPITAL_ADMIN];
    else {
      user = await prisma.user.create({
        data: {
          email: `staff.${firstName.toLowerCase()}.${lastName.toLowerCase()}.${i}@hospital.com`,
          passwordHash: defaultPasswordHash,
          role: roleCfg.role,
          firstName,
          lastName,
          phone: `+1 (555) 300-${String(i).padStart(4, "0")}`,
          status: UserStatus.ACTIVE,
        },
      });
    }

    const staff = await prisma.staff.create({
      data: {
        userId: user.id,
        departmentId: dept.id,
        designation: roleCfg.designation,
        shift: i % 3 === 0 ? StaffShift.MORNING : i % 3 === 1 ? StaffShift.EVENING : StaffShift.NIGHT,
        qualification: "BSN / Healthcare Administration Certified",
        emergencyContact: "+1 (555) 999-0112",
      },
      include: { user: true },
    });
    staffMembers.push(staff);
  }

  console.log("🛏️ Seeding 50 Rooms with 150 Beds across ICU, General, Semi-Private, Private...");
  const rooms: any[] = [];
  const beds: any[] = [];
  const roomTypes = [
    { type: RoomType.GENERAL_WARD, rate: 100.0, capacity: 4 },
    { type: RoomType.SEMI_PRIVATE, rate: 250.0, capacity: 2 },
    { type: RoomType.PRIVATE, rate: 450.0, capacity: 1 },
    { type: RoomType.ICU, rate: 850.0, capacity: 2 },
    { type: RoomType.OPERATION_THEATRE, rate: 1200.0, capacity: 1 },
    { type: RoomType.EMERGENCY, rate: 300.0, capacity: 2 },
  ];

  for (let r = 1; r <= 50; r++) {
    const rConfig = roomTypes[r % roomTypes.length];
    const floor = `${Math.floor((r - 1) / 10) + 1}st Floor`;
    const roomNumber = `${Math.floor((r - 1) / 10) + 1}0${r % 10}`;

    const room = await prisma.room.create({
      data: {
        roomNumber: `RM-${roomNumber}-${r}`,
        type: rConfig.type,
        floor,
        dailyRate: rConfig.rate,
        capacity: rConfig.capacity,
        occupiedBeds: 0,
        status: RoomStatus.AVAILABLE,
      },
    });
    rooms.push(room);

    for (let b = 1; b <= rConfig.capacity; b++) {
      const bed = await prisma.bed.create({
        data: {
          bedNumber: `BED-${r}-${b}`,
          roomId: room.id,
          isOccupied: false,
          status: BedStatus.AVAILABLE,
        },
      });
      beds.push(bed);
    }
  }

  console.log("🧑‍⚕️ Seeding 100 Patients with realistic clinical profiles...");
  const patients: any[] = [];
  const allergiesList = ["None known", "Penicillin", "Sulfa drugs", "Peanuts", "Latex", "Aspirin", "Iodine contrast"];
  const chronicList = ["None", "Hypertension", "Type 2 Diabetes", "Asthma", "Hyperlipidemia", "Coronary Artery Disease", "Osteoarthritis"];

  for (let i = 0; i < 100; i++) {
    const firstName = FIRST_NAMES[(i + 10) % FIRST_NAMES.length];
    const lastName = LAST_NAMES[(i + 20) % LAST_NAMES.length];
    const uhid = `UHID-2026-${String(i + 1).padStart(4, "0")}`;
    const gender = i % 2 === 0 ? "Male" : "Female";
    const birthYear = 1950 + (i % 55);

    let user = null;
    if (i === 0) {
      user = demoUsers[UserRole.PATIENT];
    } else if (i < 20) {
      user = await prisma.user.create({
        data: {
          email: `patient.${firstName.toLowerCase()}.${lastName.toLowerCase()}.${i}@gmail.com`,
          passwordHash: defaultPasswordHash,
          role: UserRole.PATIENT,
          firstName,
          lastName,
          phone: `+1 (555) 400-${String(i).padStart(4, "0")}`,
          status: UserStatus.ACTIVE,
        },
      });
    }

    const patient = await prisma.patient.create({
      data: {
        userId: user ? user.id : null,
        uhid,
        bloodGroup: BLOOD_GROUPS[i % BLOOD_GROUPS.length],
        dateOfBirth: new Date(`${birthYear}-0${(i % 9) + 1}-15`),
        gender,
        address: `${100 + i * 3} Healthcare Parkway, Suite ${i + 1}`,
        city: CITIES[i % CITIES.length],
        state: "CA",
        postalCode: `902${String(10 + i).padStart(2, "0")}`,
        emergencyContactName: `${FIRST_NAMES[(i + 25) % FIRST_NAMES.length]} ${lastName}`,
        emergencyContactPhone: `+1 (555) 888-${String(i).padStart(4, "0")}`,
        allergies: allergiesList[i % allergiesList.length],
        chronicConditions: chronicList[i % chronicList.length],
        insuranceProvider: INSURANCE_PROVIDERS[i % INSURANCE_PROVIDERS.length],
        insurancePolicyNumber: `POL-2026-${String(8000 + i)}`,
      },
    });
    patients.push(patient);
  }

  console.log("💊 Seeding 15 Medicines & Inventory batches...");
  const medicines: any[] = [];
  for (const mData of MEDICINES_DATA) {
    const med = await prisma.medicine.create({
      data: {
        code: mData.code,
        name: mData.name,
        genericName: mData.genericName,
        category: mData.category,
        form: mData.form,
        strength: mData.strength,
        manufacturer: mData.manufacturer,
        unitPrice: mData.price,
        reorderLevel: 50,
      },
    });
    medicines.push(med);

    await prisma.medicineInventory.create({
      data: {
        medicineId: med.id,
        batchNumber: `BAT-2026-A${med.code.replace("MED-", "")}`,
        expiryDate: new Date("2027-12-31"),
        quantityInStock: mData.stock,
        purchasePrice: mData.price * 0.65,
        sellingPrice: mData.price,
        location: `Aisle-${Math.floor(Math.random() * 5) + 1}-Bin-${Math.floor(Math.random() * 20) + 1}`,
        status: InventoryStatus.IN_STOCK,
      },
    });
  }

  console.log("🔬 Seeding 10 Lab Tests...");
  const labTests: any[] = [];
  for (const lt of LAB_TESTS_DATA) {
    const test = await prisma.labTest.create({
      data: {
        code: lt.code,
        name: lt.name,
        category: lt.category,
        standardFee: lt.fee,
        normalRange: lt.range,
        unit: lt.unit,
        turnaroundHours: 24,
      },
    });
    labTests.push(test);
  }

  console.log("🏥 Seeding 100 In-Patient Admissions & Bed assignments...");
  const admissions: any[] = [];
  for (let i = 0; i < 100; i++) {
    const patient = patients[i % patients.length];
    const doctor = doctors[i % doctors.length];
    const bed = beds[i % beds.length];
    const room = rooms.find(r => r.id === bed.roomId) || rooms[0];

    const isCurrent = i < 35;
    const admitDate = new Date();
    admitDate.setDate(admitDate.getDate() - (isCurrent ? (i % 10) + 1 : (i % 60) + 15));

    let dischargeDate = null;
    let status: AdmissionStatus = AdmissionStatus.ADMITTED;
    if (!isCurrent) {
      status = AdmissionStatus.DISCHARGED;
      dischargeDate = new Date(admitDate);
      dischargeDate.setDate(dischargeDate.getDate() + 4 + (i % 5));
    }

    const admissionNumber = `ADM-2026-${String(i + 1).padStart(4, "0")}`;

    const adm = await prisma.admission.create({
      data: {
        admissionNumber,
        patientId: patient.id,
        doctorId: doctor.id,
        roomId: room.id,
        bedId: bed.id,
        admissionDate: admitDate,
        dischargeDate,
        status,
        admissionType: i % 4 === 0 ? AdmissionType.EMERGENCY : AdmissionType.ELECTIVE,
        diagnosisAtAdmission: `Acute clinical presentation: ${patient.chronicConditions || "Under evaluation"}`,
        dischargeSummary: !isCurrent ? "Patient treated successfully with intravenous therapeutics, vitals stable, discharged on oral medication." : null,
      },
    });
    admissions.push(adm);

    if (isCurrent) {
      await prisma.bed.update({
        where: { id: bed.id },
        data: {
          isOccupied: true,
          status: BedStatus.OCCUPIED,
          patientId: patient.id,
        },
      });
      await prisma.room.update({
        where: { id: room.id },
        data: { occupiedBeds: { increment: 1 } },
      });
    }
  }

  console.log("📅 Seeding 300 Outpatient Appointments...");
  const appointments: any[] = [];
  const timeSlots = ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM"];

  for (let i = 0; i < 300; i++) {
    const patient = patients[i % patients.length];
    const doctor = doctors[i % doctors.length];
    const dept = departments.find(d => d.id === doctor.departmentId) || departments[0];

    const apptDate = new Date();
    if (i < 50) {
      apptDate.setHours(0, 0, 0, 0);
    } else if (i < 200) {
      apptDate.setDate(apptDate.getDate() - ((i % 45) + 1));
    } else {
      apptDate.setDate(apptDate.getDate() + ((i % 14) + 1));
    }

    const tokenNumber = (i % 15) + 1;
    const timeSlot = timeSlots[i % timeSlots.length];
    let status: AppointmentStatus = AppointmentStatus.SCHEDULED;
    if (i >= 50 && i < 200) status = AppointmentStatus.COMPLETED;
    else if (i < 10) status = AppointmentStatus.IN_CONSULTATION;

    const appt = await prisma.appointment.create({
      data: {
        appointmentNumber: `APT-2026-${String(i + 1).padStart(5, "0")}`,
        patientId: patient.id,
        doctorId: doctor.id,
        departmentId: dept.id,
        appointmentDate: apptDate,
        timeSlot,
        tokenNumber,
        status,
        type: i % 5 === 0 ? AppointmentType.FOLLOW_UP : AppointmentType.OUTPATIENT,
        priority: i % 10 === 0 ? PriorityLevel.URGENT : PriorityLevel.NORMAL,
        vitalsJson: JSON.stringify({
          bp: "120/80",
          pulse: 74 + (i % 10),
          temp: "98.6 F",
          spo2: "99%",
          weight: "72 kg",
        }),
        notes: `Clinical consultation for routine checkup and symptom assessment.`,
      },
    });
    appointments.push(appt);
  }

  console.log("📝 Seeding 100 Prescriptions with dosages...");
  const prescriptions: any[] = [];
  for (let i = 0; i < 100; i++) {
    const patient = patients[i % patients.length];
    const doctor = doctors[i % doctors.length];
    const appt = appointments[i % appointments.length];

    const rx = await prisma.prescription.create({
      data: {
        prescriptionNumber: `RX-2026-${String(i + 1).padStart(4, "0")}`,
        patientId: patient.id,
        doctorId: doctor.id,
        appointmentId: appt.id,
        status: i < 50 ? PrescriptionStatus.DISPENSED : PrescriptionStatus.ACTIVE,
        notes: "Take medications on time after meals with plenty of water. Return if symptoms persist.",
      },
    });
    prescriptions.push(rx);

    const numItems = 2 + (i % 2);
    for (let j = 0; j < numItems; j++) {
      const med = medicines[(i + j) % medicines.length];
      await prisma.prescriptionItem.create({
        data: {
          prescriptionId: rx.id,
          medicineId: med.id,
          medicineName: med.name,
          dosage: "1 unit",
          frequency: j === 0 ? "TDS (3 times daily)" : "BD (2 times daily)",
          durationDays: 5 + (j * 2),
          instructions: "Take after food with water",
          isDispensed: i < 50,
        },
      });
    }
  }

  console.log("💳 Seeding 200 Bills, Invoices and Cashier Payments...");
  const cashierUser = demoUsers[UserRole.CASHIER];

  for (let i = 0; i < 200; i++) {
    const patient = patients[i % patients.length];
    const isPaid = i < 140;
    const billType = i % 3 === 0 ? BillType.INPATIENT : i % 3 === 1 ? BillType.OUTPATIENT : BillType.PHARMACY;
    const baseAmount = billType === BillType.INPATIENT ? 850.0 + (i * 15) : billType === BillType.OUTPATIENT ? 150.0 : 65.0 + (i * 2);

    const billNumber = `INV-2026-${String(i + 1).padStart(5, "0")}`;
    const paidAmount = isPaid ? baseAmount : (i % 2 === 0 ? 0 : baseAmount * 0.5);
    const balanceAmount = baseAmount - paidAmount;
    const paymentStatus = balanceAmount <= 0 ? PaymentStatus.PAID : paidAmount > 0 ? PaymentStatus.PARTIALLY_PAID : PaymentStatus.PENDING;
    const billDate = new Date(Date.now() - ((i * 7) % 330) * 24 * 60 * 60 * 1000);

    const bill = await prisma.bill.create({
      data: {
        billNumber,
        createdAt: billDate,
        patientId: patient.id,
        billType,
        totalAmount: baseAmount,
        discountAmount: 0.0,
        taxAmount: 0.0,
        netAmount: baseAmount,
        paidAmount,
        balanceAmount,
        paymentStatus,
        dueDate: new Date(),
        items: {
          create: [
            {
              description: `${billType} Services and Treatment Charges`,
              quantity: 1,
              unitPrice: baseAmount,
              totalPrice: baseAmount,
            },
          ],
        },
      },
    });

    await prisma.invoice.create({
      data: {
        invoiceNumber: `FIN-2026-${String(i + 1).padStart(5, "0")}`,
        billId: bill.id,
        status: isPaid ? "PAID" : "ISSUED",
      },
    });

    if (paidAmount > 0) {
      await prisma.payment.create({
        data: {
          receiptNumber: `RCP-2026-${String(i + 1).padStart(5, "0")}`,
          billId: bill.id,
          cashierId: cashierUser.id,
          patientId: patient.id,
          amount: paidAmount,
          paymentMethod: i % 4 === 0 ? PaymentMethod.CASH : i % 4 === 1 ? PaymentMethod.CREDIT_CARD : i % 4 === 2 ? PaymentMethod.UPI : PaymentMethod.INSURANCE,
          transactionRef: `TXN-${900000 + i}`,
          status: "SUCCESS",
          notes: "Settled via automated cashier desk",
          createdAt: billDate,
        },
      });
    }
  }

  console.log("🧪 Seeding Lab Requests and Technician Verified Reports...");
  const labTechStaff = staffMembers.find(s => s.user.role === UserRole.LAB_TECHNICIAN) || staffMembers[3];

  for (let i = 0; i < 40; i++) {
    const patient = patients[i % patients.length];
    const doctor = doctors[i % doctors.length];
    const test = labTests[i % labTests.length];
    const isCompleted = i < 25;

    const request = await prisma.labRequest.create({
      data: {
        requestNumber: `LR-2026-${String(i + 1).padStart(4, "0")}`,
        patientId: patient.id,
        doctorId: doctor.id,
        labTestId: test.id,
        status: isCompleted ? LabRequestStatus.COMPLETED : LabRequestStatus.PENDING,
        priority: i % 5 === 0 ? PriorityLevel.URGENT : PriorityLevel.NORMAL,
        completedAt: isCompleted ? new Date() : null,
      },
    });

    if (isCompleted) {
      await prisma.labReport.create({
        data: {
          labRequestId: request.id,
          technicianId: labTechStaff.id,
          resultJson: JSON.stringify({
            testName: test.name,
            findings: "All test parameters within clinical normal limits.",
            normalRange: test.normalRange,
            unit: test.unit,
            verifiedStatus: "Pass",
          }),
          remarks: "Verified and signed off by laboratory supervisor.",
          isAbnormal: i % 6 === 0,
          verifiedAt: new Date(),
        },
      });
    }
  }

  console.log("🔔 Seeding System Notifications & Activity Logs...");
  for (const role of roleNames) {
    const user = demoUsers[role];
    if (user) {
      await prisma.notification.createMany({
        data: [
          {
            userId: user.id,
            title: `Welcome to Hospital ERP 2026`,
            message: `Your account with role ${role} has been provisioned with full clinical and administrative permissions.`,
            type: "SUCCESS",
            isRead: false,
          },
          {
            userId: user.id,
            title: "Hospital Operational Broadcast",
            message: "Routine morning clinical huddle completed. All telemetry and emergency triage channels active.",
            type: "INFO",
            isRead: true,
          },
        ],
      });
    }
  }

  console.log("✅ SEED COMPLETED SUCCESSFULLY!");
  console.log("==================================================");
  console.log("Summary of Seeded Data:");
  console.log("  - Departments: 10");
  console.log("  - Doctors: 30");
  console.log("  - Staff: 40");
  console.log("  - Rooms: 50 (150 Beds)");
  console.log("  - Patients: 100");
  console.log("  - Medicines: 15 with batch inventory");
  console.log("  - Admissions: 100");
  console.log("  - Appointments: 300");
  console.log("  - Prescriptions: 100");
  console.log("  - Bills: 200 with Payments");
  console.log("  - Lab Requests: 40 with Reports");
  console.log("Demo Credentials for All Roles (Password: Hospital@123):");
  demoUsersConfig.forEach(u => console.log(`  - ${u.role.padEnd(16)}: ${u.email}`));
  console.log("==================================================");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
