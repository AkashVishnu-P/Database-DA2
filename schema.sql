-- ====================================================================
-- CAREPULSE HOSPITAL MANAGEMENT SYSTEM (HMS / ERP) - PRODUCTION SCHEMA
-- Database: MySQL 8.0+
-- Encoding: UTF8MB4
-- ====================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------------------
-- 1. USERS & ACCESS CONTROL (RBAC)
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `User` (
  `id` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `passwordHash` VARCHAR(255) NOT NULL,
  `role` ENUM(
    'SUPER_ADMIN',
    'HOSPITAL_ADMIN',
    'DOCTOR',
    'RECEPTIONIST',
    'NURSE',
    'CASHIER',
    'LAB_TECHNICIAN',
    'PHARMACIST',
    'PATIENT'
  ) NOT NULL DEFAULT 'PATIENT',
  `firstName` VARCHAR(100) NOT NULL,
  `lastName` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(50) NULL,
  `avatar` VARCHAR(255) NULL,
  `status` ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`),
  INDEX `User_role_idx` (`role`),
  INDEX `User_email_idx` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Role` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `description` VARCHAR(255) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Role_name_key` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Permission` (
  `id` VARCHAR(191) NOT NULL,
  `roleId` VARCHAR(191) NOT NULL,
  `module` VARCHAR(100) NOT NULL,
  `action` VARCHAR(50) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Permission_roleId_module_action_key` (`roleId`, `module`, `action`),
  INDEX `Permission_roleId_idx` (`roleId`),
  CONSTRAINT `Permission_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 2. DEPARTMENTS & CLINICAL STAFF
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `Department` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `code` VARCHAR(50) NOT NULL,
  `description` TEXT NULL,
  `floor` VARCHAR(50) NULL,
  `contactNumber` VARCHAR(50) NULL,
  `headDoctorId` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Department_name_key` (`name`),
  UNIQUE KEY `Department_code_key` (`code`),
  INDEX `Department_code_idx` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Doctor` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `departmentId` VARCHAR(191) NOT NULL,
  `licenseNumber` VARCHAR(100) NOT NULL,
  `specialization` VARCHAR(150) NOT NULL,
  `qualification` VARCHAR(255) NOT NULL,
  `experienceYears` INT NOT NULL DEFAULT 0,
  `consultationFee` DECIMAL(10, 2) NOT NULL DEFAULT 50.00,
  `roomNumber` VARCHAR(50) NULL,
  `scheduleJson` TEXT NULL,
  `status` ENUM('AVAILABLE', 'ON_DUTY', 'IN_CONSULTATION', 'ON_LEAVE', 'OFF_DUTY') NOT NULL DEFAULT 'AVAILABLE',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Doctor_userId_key` (`userId`),
  UNIQUE KEY `Doctor_licenseNumber_key` (`licenseNumber`),
  INDEX `Doctor_departmentId_idx` (`departmentId`),
  INDEX `Doctor_status_idx` (`status`),
  CONSTRAINT `Doctor_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Doctor_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Staff` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `departmentId` VARCHAR(191) NOT NULL,
  `designation` VARCHAR(100) NOT NULL,
  `shift` ENUM('MORNING', 'EVENING', 'NIGHT', 'ROTATING') NOT NULL DEFAULT 'MORNING',
  `emergencyContact` VARCHAR(50) NULL,
  `qualification` VARCHAR(255) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Staff_userId_key` (`userId`),
  INDEX `Staff_departmentId_idx` (`departmentId`),
  CONSTRAINT `Staff_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Staff_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 3. PATIENTS
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `Patient` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NULL,
  `uhid` VARCHAR(100) NOT NULL,
  `bloodGroup` VARCHAR(10) NULL,
  `dateOfBirth` DATETIME(3) NOT NULL,
  `gender` VARCHAR(20) NOT NULL,
  `address` TEXT NULL,
  `city` VARCHAR(100) NULL,
  `state` VARCHAR(100) NULL,
  `postalCode` VARCHAR(20) NULL,
  `emergencyContactName` VARCHAR(100) NULL,
  `emergencyContactPhone` VARCHAR(50) NULL,
  `allergies` TEXT NULL,
  `chronicConditions` TEXT NULL,
  `insuranceProvider` VARCHAR(150) NULL,
  `insurancePolicyNumber` VARCHAR(100) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Patient_uhid_key` (`uhid`),
  UNIQUE KEY `Patient_userId_key` (`userId`),
  INDEX `Patient_uhid_idx` (`uhid`),
  CONSTRAINT `Patient_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 4. ROOMS & BEDS INFRASTRUCTURE
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `Room` (
  `id` VARCHAR(191) NOT NULL,
  `roomNumber` VARCHAR(50) NOT NULL,
  `type` ENUM(
    'GENERAL_WARD',
    'SEMI_PRIVATE',
    'PRIVATE',
    'ICU',
    'OPERATION_THEATRE',
    'EMERGENCY'
  ) NOT NULL DEFAULT 'GENERAL_WARD',
  `floor` VARCHAR(50) NOT NULL,
  `dailyRate` DECIMAL(10, 2) NOT NULL,
  `capacity` INT NOT NULL DEFAULT 1,
  `occupiedBeds` INT NOT NULL DEFAULT 0,
  `status` ENUM('AVAILABLE', 'FULL', 'MAINTENANCE', 'RESERVED') NOT NULL DEFAULT 'AVAILABLE',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Room_roomNumber_key` (`roomNumber`),
  INDEX `Room_roomNumber_idx` (`roomNumber`),
  INDEX `Room_type_idx` (`type`),
  INDEX `Room_status_idx` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Bed` (
  `id` VARCHAR(191) NOT NULL,
  `bedNumber` VARCHAR(50) NOT NULL,
  `roomId` VARCHAR(191) NOT NULL,
  `isOccupied` BOOLEAN NOT NULL DEFAULT FALSE,
  `status` ENUM('AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'CLEANING') NOT NULL DEFAULT 'AVAILABLE',
  `patientId` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Bed_patientId_key` (`patientId`),
  UNIQUE KEY `Bed_roomId_bedNumber_key` (`roomId`, `bedNumber`),
  INDEX `Bed_roomId_idx` (`roomId`),
  INDEX `Bed_isOccupied_idx` (`isOccupied`),
  INDEX `Bed_status_idx` (`status`),
  CONSTRAINT `Bed_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Bed_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 5. INPATIENT ADMISSIONS & OUTPATIENT APPOINTMENTS
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `Admission` (
  `id` VARCHAR(191) NOT NULL,
  `admissionNumber` VARCHAR(100) NOT NULL,
  `patientId` VARCHAR(191) NOT NULL,
  `doctorId` VARCHAR(191) NOT NULL,
  `roomId` VARCHAR(191) NOT NULL,
  `bedId` VARCHAR(191) NOT NULL,
  `admissionDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `dischargeDate` DATETIME(3) NULL,
  `status` ENUM('ADMITTED', 'DISCHARGED', 'TRANSFERRED', 'CANCELLED') NOT NULL DEFAULT 'ADMITTED',
  `admissionType` ENUM('EMERGENCY', 'ELECTIVE', 'URGENT') NOT NULL DEFAULT 'ELECTIVE',
  `diagnosisAtAdmission` TEXT NULL,
  `dischargeSummary` TEXT NULL,
  `dischargeDoctorId` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Admission_admissionNumber_key` (`admissionNumber`),
  INDEX `Admission_patientId_idx` (`patientId`),
  INDEX `Admission_doctorId_idx` (`doctorId`),
  INDEX `Admission_roomId_idx` (`roomId`),
  INDEX `Admission_bedId_idx` (`bedId`),
  INDEX `Admission_status_idx` (`status`),
  CONSTRAINT `Admission_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Admission_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `Doctor` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `Admission_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `Admission_bedId_fkey` FOREIGN KEY (`bedId`) REFERENCES `Bed` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Appointment` (
  `id` VARCHAR(191) NOT NULL,
  `appointmentNumber` VARCHAR(100) NOT NULL,
  `patientId` VARCHAR(191) NOT NULL,
  `doctorId` VARCHAR(191) NOT NULL,
  `departmentId` VARCHAR(191) NOT NULL,
  `appointmentDate` DATETIME(3) NOT NULL,
  `timeSlot` VARCHAR(50) NOT NULL,
  `tokenNumber` INT NOT NULL,
  `status` ENUM('SCHEDULED', 'CONFIRMED', 'IN_CONSULTATION', 'COMPLETED', 'CANCELLED', 'NO_SHOW') NOT NULL DEFAULT 'SCHEDULED',
  `type` ENUM('OUTPATIENT', 'FOLLOW_UP', 'EMERGENCY', 'ROUTINE_CHECKUP') NOT NULL DEFAULT 'OUTPATIENT',
  `priority` ENUM('NORMAL', 'URGENT', 'EMERGENCY') NOT NULL DEFAULT 'NORMAL',
  `vitalsJson` TEXT NULL,
  `notes` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Appointment_appointmentNumber_key` (`appointmentNumber`),
  INDEX `Appointment_patientId_idx` (`patientId`),
  INDEX `Appointment_doctorId_idx` (`doctorId`),
  INDEX `Appointment_departmentId_idx` (`departmentId`),
  INDEX `Appointment_appointmentDate_idx` (`appointmentDate`),
  INDEX `Appointment_status_idx` (`status`),
  CONSTRAINT `Appointment_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Appointment_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `Doctor` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `Appointment_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 6. PHARMACY & INVENTORY
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `Medicine` (
  `id` VARCHAR(191) NOT NULL,
  `code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `genericName` VARCHAR(150) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `form` ENUM('TABLET', 'CAPSULE', 'SYRUP', 'INJECTION', 'OINTMENT', 'DROPS', 'INHALER') NOT NULL DEFAULT 'TABLET',
  `strength` VARCHAR(50) NOT NULL,
  `manufacturer` VARCHAR(150) NOT NULL,
  `unitPrice` DECIMAL(10, 2) NOT NULL,
  `reorderLevel` INT NOT NULL DEFAULT 50,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Medicine_code_key` (`code`),
  INDEX `Medicine_name_idx` (`name`),
  INDEX `Medicine_genericName_idx` (`genericName`),
  INDEX `Medicine_category_idx` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `MedicineInventory` (
  `id` VARCHAR(191) NOT NULL,
  `medicineId` VARCHAR(191) NOT NULL,
  `batchNumber` VARCHAR(100) NOT NULL,
  `expiryDate` DATETIME(3) NOT NULL,
  `quantityInStock` INT NOT NULL DEFAULT 0,
  `purchasePrice` DECIMAL(10, 2) NOT NULL,
  `sellingPrice` DECIMAL(10, 2) NOT NULL,
  `location` VARCHAR(100) NULL,
  `status` ENUM('IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'EXPIRED') NOT NULL DEFAULT 'IN_STOCK',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `MedicineInventory_medicineId_batchNumber_key` (`medicineId`, `batchNumber`),
  INDEX `MedicineInventory_medicineId_idx` (`medicineId`),
  INDEX `MedicineInventory_expiryDate_idx` (`expiryDate`),
  INDEX `MedicineInventory_status_idx` (`status`),
  CONSTRAINT `MedicineInventory_medicineId_fkey` FOREIGN KEY (`medicineId`) REFERENCES `Medicine` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Prescription` (
  `id` VARCHAR(191) NOT NULL,
  `prescriptionNumber` VARCHAR(100) NOT NULL,
  `patientId` VARCHAR(191) NOT NULL,
  `doctorId` VARCHAR(191) NOT NULL,
  `appointmentId` VARCHAR(191) NULL,
  `admissionId` VARCHAR(191) NULL,
  `status` ENUM('ACTIVE', 'DISPENSED', 'PARTIALLY_DISPENSED', 'CANCELLED') NOT NULL DEFAULT 'ACTIVE',
  `notes` TEXT NULL,
  `issuedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Prescription_prescriptionNumber_key` (`prescriptionNumber`),
  INDEX `Prescription_patientId_idx` (`patientId`),
  INDEX `Prescription_doctorId_idx` (`doctorId`),
  INDEX `Prescription_status_idx` (`status`),
  CONSTRAINT `Prescription_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Prescription_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `Doctor` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `Prescription_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `Appointment` (`id`) ON DELETE SET NULL,
  CONSTRAINT `Prescription_admissionId_fkey` FOREIGN KEY (`admissionId`) REFERENCES `Admission` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `PrescriptionItem` (
  `id` VARCHAR(191) NOT NULL,
  `prescriptionId` VARCHAR(191) NOT NULL,
  `medicineId` VARCHAR(191) NOT NULL,
  `medicineName` VARCHAR(150) NOT NULL,
  `dosage` VARCHAR(100) NOT NULL,
  `frequency` VARCHAR(100) NOT NULL,
  `durationDays` INT NOT NULL DEFAULT 5,
  `instructions` VARCHAR(255) NULL,
  `isDispensed` BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (`id`),
  INDEX `PrescriptionItem_prescriptionId_idx` (`prescriptionId`),
  INDEX `PrescriptionItem_medicineId_idx` (`medicineId`),
  CONSTRAINT `PrescriptionItem_prescriptionId_fkey` FOREIGN KEY (`prescriptionId`) REFERENCES `Prescription` (`id`) ON DELETE CASCADE,
  CONSTRAINT `PrescriptionItem_medicineId_fkey` FOREIGN KEY (`medicineId`) REFERENCES `Medicine` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 7. LABORATORY & DIAGNOSTICS
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `LabTest` (
  `id` VARCHAR(191) NOT NULL,
  `code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `standardFee` DECIMAL(10, 2) NOT NULL,
  `normalRange` TEXT NULL,
  `unit` VARCHAR(50) NULL,
  `turnaroundHours` INT NOT NULL DEFAULT 24,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `LabTest_code_key` (`code`),
  INDEX `LabTest_code_idx` (`code`),
  INDEX `LabTest_category_idx` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `LabRequest` (
  `id` VARCHAR(191) NOT NULL,
  `requestNumber` VARCHAR(100) NOT NULL,
  `patientId` VARCHAR(191) NOT NULL,
  `doctorId` VARCHAR(191) NOT NULL,
  `appointmentId` VARCHAR(191) NULL,
  `admissionId` VARCHAR(191) NULL,
  `labTestId` VARCHAR(191) NOT NULL,
  `status` ENUM('PENDING', 'SAMPLE_COLLECTED', 'IN_ANALYSIS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
  `priority` ENUM('NORMAL', 'URGENT', 'EMERGENCY') NOT NULL DEFAULT 'NORMAL',
  `requestedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `completedAt` DATETIME(3) NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `LabRequest_requestNumber_key` (`requestNumber`),
  INDEX `LabRequest_patientId_idx` (`patientId`),
  INDEX `LabRequest_doctorId_idx` (`doctorId`),
  INDEX `LabRequest_labTestId_idx` (`labTestId`),
  INDEX `LabRequest_status_idx` (`status`),
  CONSTRAINT `LabRequest_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient` (`id`) ON DELETE CASCADE,
  CONSTRAINT `LabRequest_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `Doctor` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `LabRequest_labTestId_fkey` FOREIGN KEY (`labTestId`) REFERENCES `LabTest` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `LabReport` (
  `id` VARCHAR(191) NOT NULL,
  `labRequestId` VARCHAR(191) NOT NULL,
  `technicianId` VARCHAR(191) NOT NULL,
  `resultJson` TEXT NOT NULL,
  `remarks` TEXT NULL,
  `isAbnormal` BOOLEAN NOT NULL DEFAULT FALSE,
  `reportFileUrl` VARCHAR(255) NULL,
  `verifiedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `LabReport_labRequestId_key` (`labRequestId`),
  INDEX `LabReport_technicianId_idx` (`technicianId`),
  CONSTRAINT `LabReport_labRequestId_fkey` FOREIGN KEY (`labRequestId`) REFERENCES `LabRequest` (`id`) ON DELETE CASCADE,
  CONSTRAINT `LabReport_technicianId_fkey` FOREIGN KEY (`technicianId`) REFERENCES `Staff` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 8. BILLING, PAYMENTS & AUDIT TRAILS
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `Bill` (
  `id` VARCHAR(191) NOT NULL,
  `billNumber` VARCHAR(100) NOT NULL,
  `patientId` VARCHAR(191) NOT NULL,
  `admissionId` VARCHAR(191) NULL,
  `appointmentId` VARCHAR(191) NULL,
  `billType` ENUM('INPATIENT', 'OUTPATIENT', 'PHARMACY', 'LAB', 'GENERAL') NOT NULL DEFAULT 'GENERAL',
  `totalAmount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `discountAmount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `taxAmount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `netAmount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `paidAmount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `balanceAmount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `paymentStatus` ENUM('PENDING', 'PARTIALLY_PAID', 'PAID', 'CANCELLED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
  `dueDate` DATETIME(3) NULL,
  `notes` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Bill_billNumber_key` (`billNumber`),
  INDEX `Bill_patientId_idx` (`patientId`),
  INDEX `Bill_admissionId_idx` (`admissionId`),
  INDEX `Bill_paymentStatus_idx` (`paymentStatus`),
  INDEX `Bill_createdAt_idx` (`createdAt`),
  CONSTRAINT `Bill_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Bill_admissionId_fkey` FOREIGN KEY (`admissionId`) REFERENCES `Admission` (`id`) ON DELETE SET NULL,
  CONSTRAINT `Bill_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `Appointment` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `BillItem` (
  `id` VARCHAR(191) NOT NULL,
  `billId` VARCHAR(191) NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `unitPrice` DECIMAL(10, 2) NOT NULL,
  `totalPrice` DECIMAL(10, 2) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `BillItem_billId_idx` (`billId`),
  CONSTRAINT `BillItem_billId_fkey` FOREIGN KEY (`billId`) REFERENCES `Bill` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Payment` (
  `id` VARCHAR(191) NOT NULL,
  `receiptNumber` VARCHAR(100) NOT NULL,
  `billId` VARCHAR(191) NOT NULL,
  `cashierId` VARCHAR(191) NOT NULL,
  `patientId` VARCHAR(191) NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `paymentMethod` ENUM('CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'NET_BANKING', 'INSURANCE', 'CHEQUE') NOT NULL DEFAULT 'CASH',
  `transactionRef` VARCHAR(100) NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'SUCCESS',
  `notes` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Payment_receiptNumber_key` (`receiptNumber`),
  INDEX `Payment_billId_idx` (`billId`),
  INDEX `Payment_cashierId_idx` (`cashierId`),
  CONSTRAINT `Payment_billId_fkey` FOREIGN KEY (`billId`) REFERENCES `Bill` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Payment_cashierId_fkey` FOREIGN KEY (`cashierId`) REFERENCES `User` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ActivityLog` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NULL,
  `action` VARCHAR(100) NOT NULL,
  `entityType` VARCHAR(100) NOT NULL,
  `entityId` VARCHAR(191) NULL,
  `detailsJson` TEXT NULL,
  `ipAddress` VARCHAR(50) NULL,
  `userAgent` VARCHAR(255) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `ActivityLog_userId_idx` (`userId`),
  INDEX `ActivityLog_action_idx` (`action`),
  INDEX `ActivityLog_createdAt_idx` (`createdAt`),
  CONSTRAINT `ActivityLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Notification` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `message` TEXT NOT NULL,
  `type` ENUM('INFO', 'WARNING', 'SUCCESS', 'DANGER') NOT NULL DEFAULT 'INFO',
  `isRead` BOOLEAN NOT NULL DEFAULT FALSE,
  `link` VARCHAR(255) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `Notification_userId_idx` (`userId`),
  INDEX `Notification_isRead_idx` (`isRead`),
  CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
