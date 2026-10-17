CREATE DATABASE IF NOT EXISTS `DBMS_PROJECT` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `DBMS_PROJECT`;

CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `role` ENUM('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'RECEPTIONIST', 'NURSE', 'CASHIER', 'LAB_TECHNICIAN', 'PHARMACIST', 'PATIENT') NOT NULL DEFAULT 'PATIENT',
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `avatar` VARCHAR(191) NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `User_email_key`(`email`),
    INDEX `User_role_idx`(`role`),
    INDEX `User_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Role` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `Role_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Permission` (
    `id` VARCHAR(191) NOT NULL,
    `roleId` VARCHAR(191) NOT NULL,
    `module` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `Permission_roleId_idx`(`roleId`),
    UNIQUE INDEX `Permission_roleId_module_action_key`(`roleId`, `module`, `action`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Department` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `floor` VARCHAR(191) NULL,
    `contactNumber` VARCHAR(191) NULL,
    `headDoctorId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `Department_name_key`(`name`),
    UNIQUE INDEX `Department_code_key`(`code`),
    INDEX `Department_code_idx`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Doctor` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `departmentId` VARCHAR(191) NOT NULL,
    `licenseNumber` VARCHAR(191) NOT NULL,
    `specialization` VARCHAR(191) NOT NULL,
    `qualification` VARCHAR(191) NOT NULL,
    `experienceYears` INTEGER NOT NULL DEFAULT 0,
    `consultationFee` DECIMAL(10, 2) NOT NULL DEFAULT 50.00,
    `roomNumber` VARCHAR(191) NULL,
    `scheduleJson` TEXT NULL,
    `status` ENUM('AVAILABLE', 'ON_DUTY', 'IN_CONSULTATION', 'ON_LEAVE', 'OFF_DUTY') NOT NULL DEFAULT 'AVAILABLE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `Doctor_userId_key`(`userId`),
    UNIQUE INDEX `Doctor_licenseNumber_key`(`licenseNumber`),
    INDEX `Doctor_departmentId_idx`(`departmentId`),
    INDEX `Doctor_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Staff` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `departmentId` VARCHAR(191) NOT NULL,
    `designation` VARCHAR(191) NOT NULL,
    `shift` ENUM('MORNING', 'EVENING', 'NIGHT', 'ROTATING') NOT NULL DEFAULT 'MORNING',
    `emergencyContact` VARCHAR(191) NULL,
    `qualification` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `Staff_userId_key`(`userId`),
    INDEX `Staff_departmentId_idx`(`departmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Patient` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `uhid` VARCHAR(191) NOT NULL,
    `bloodGroup` VARCHAR(191) NULL,
    `dateOfBirth` DATETIME(3) NOT NULL,
    `gender` VARCHAR(191) NOT NULL,
    `address` TEXT NULL,
    `city` VARCHAR(191) NULL,
    `state` VARCHAR(191) NULL,
    `postalCode` VARCHAR(191) NULL,
    `emergencyContactName` VARCHAR(191) NULL,
    `emergencyContactPhone` VARCHAR(191) NULL,
    `allergies` TEXT NULL,
    `chronicConditions` TEXT NULL,
    `insuranceProvider` VARCHAR(191) NULL,
    `insurancePolicyNumber` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `Patient_userId_key`(`userId`),
    UNIQUE INDEX `Patient_uhid_key`(`uhid`),
    INDEX `Patient_uhid_idx`(`uhid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Room` (
    `id` VARCHAR(191) NOT NULL,
    `roomNumber` VARCHAR(191) NOT NULL,
    `type` ENUM('GENERAL_WARD', 'SEMI_PRIVATE', 'PRIVATE', 'ICU', 'OPERATION_THEATRE', 'EMERGENCY') NOT NULL DEFAULT 'GENERAL_WARD',
    `floor` VARCHAR(191) NOT NULL,
    `dailyRate` DECIMAL(10, 2) NOT NULL,
    `capacity` INTEGER NOT NULL DEFAULT 1,
    `occupiedBeds` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('AVAILABLE', 'FULL', 'MAINTENANCE', 'RESERVED') NOT NULL DEFAULT 'AVAILABLE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `Room_roomNumber_key`(`roomNumber`),
    INDEX `Room_roomNumber_idx`(`roomNumber`),
    INDEX `Room_type_idx`(`type`),
    INDEX `Room_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Bed` (
    `id` VARCHAR(191) NOT NULL,
    `bedNumber` VARCHAR(191) NOT NULL,
    `roomId` VARCHAR(191) NOT NULL,
    `isOccupied` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'CLEANING') NOT NULL DEFAULT 'AVAILABLE',
    `patientId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `Bed_patientId_key`(`patientId`),
    INDEX `Bed_roomId_idx`(`roomId`),
    INDEX `Bed_isOccupied_idx`(`isOccupied`),
    INDEX `Bed_status_idx`(`status`),
    UNIQUE INDEX `Bed_roomId_bedNumber_key`(`roomId`, `bedNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Admission` (
    `id` VARCHAR(191) NOT NULL,
    `admissionNumber` VARCHAR(191) NOT NULL,
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
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `Admission_admissionNumber_key`(`admissionNumber`),
    INDEX `Admission_patientId_idx`(`patientId`),
    INDEX `Admission_doctorId_idx`(`doctorId`),
    INDEX `Admission_roomId_idx`(`roomId`),
    INDEX `Admission_bedId_idx`(`bedId`),
    INDEX `Admission_status_idx`(`status`),
    INDEX `Admission_admissionNumber_idx`(`admissionNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Appointment` (
    `id` VARCHAR(191) NOT NULL,
    `appointmentNumber` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `doctorId` VARCHAR(191) NOT NULL,
    `departmentId` VARCHAR(191) NOT NULL,
    `appointmentDate` DATETIME(3) NOT NULL,
    `timeSlot` VARCHAR(191) NOT NULL,
    `tokenNumber` INTEGER NOT NULL,
    `status` ENUM('SCHEDULED', 'CONFIRMED', 'IN_CONSULTATION', 'COMPLETED', 'CANCELLED', 'NO_SHOW') NOT NULL DEFAULT 'SCHEDULED',
    `type` ENUM('OUTPATIENT', 'FOLLOW_UP', 'EMERGENCY', 'ROUTINE_CHECKUP') NOT NULL DEFAULT 'OUTPATIENT',
    `priority` ENUM('NORMAL', 'URGENT', 'EMERGENCY') NOT NULL DEFAULT 'NORMAL',
    `vitalsJson` TEXT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `Appointment_appointmentNumber_key`(`appointmentNumber`),
    INDEX `Appointment_patientId_idx`(`patientId`),
    INDEX `Appointment_doctorId_idx`(`doctorId`),
    INDEX `Appointment_departmentId_idx`(`departmentId`),
    INDEX `Appointment_appointmentDate_idx`(`appointmentDate`),
    INDEX `Appointment_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `MedicalRecord` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `doctorId` VARCHAR(191) NOT NULL,
    `appointmentId` VARCHAR(191) NULL,
    `admissionId` VARCHAR(191) NULL,
    `visitDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `chiefComplaint` TEXT NOT NULL,
    `symptoms` TEXT NULL,
    `examinationNotes` TEXT NULL,
    `diagnosis` TEXT NULL,
    `vitalsJson` TEXT NULL,
    `attachmentsJson` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    INDEX `MedicalRecord_patientId_idx`(`patientId`),
    INDEX `MedicalRecord_doctorId_idx`(`doctorId`),
    INDEX `MedicalRecord_visitDate_idx`(`visitDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Diagnosis` (
    `id` VARCHAR(191) NOT NULL,
    `medicalRecordId` VARCHAR(191) NOT NULL,
    `icdCode` VARCHAR(191) NULL,
    `description` VARCHAR(191) NOT NULL,
    `type` ENUM('PRIMARY', 'SECONDARY', 'PROVISIONAL') NOT NULL DEFAULT 'PRIMARY',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `Diagnosis_medicalRecordId_idx`(`medicalRecordId`),
    INDEX `Diagnosis_icdCode_idx`(`icdCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Medicine` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `genericName` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `form` ENUM('TABLET', 'CAPSULE', 'SYRUP', 'INJECTION', 'OINTMENT', 'DROPS', 'INHALER') NOT NULL DEFAULT 'TABLET',
    `strength` VARCHAR(191) NOT NULL,
    `manufacturer` VARCHAR(191) NOT NULL,
    `unitPrice` DECIMAL(10, 2) NOT NULL,
    `reorderLevel` INTEGER NOT NULL DEFAULT 50,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `Medicine_code_key`(`code`),
    INDEX `Medicine_name_idx`(`name`),
    INDEX `Medicine_genericName_idx`(`genericName`),
    INDEX `Medicine_category_idx`(`category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `MedicineInventory` (
    `id` VARCHAR(191) NOT NULL,
    `medicineId` VARCHAR(191) NOT NULL,
    `batchNumber` VARCHAR(191) NOT NULL,
    `expiryDate` DATETIME(3) NOT NULL,
    `quantityInStock` INTEGER NOT NULL DEFAULT 0,
    `purchasePrice` DECIMAL(10, 2) NOT NULL,
    `sellingPrice` DECIMAL(10, 2) NOT NULL,
    `location` VARCHAR(191) NULL,
    `status` ENUM('IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'EXPIRED') NOT NULL DEFAULT 'IN_STOCK',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    INDEX `MedicineInventory_medicineId_idx`(`medicineId`),
    INDEX `MedicineInventory_expiryDate_idx`(`expiryDate`),
    INDEX `MedicineInventory_status_idx`(`status`),
    UNIQUE INDEX `MedicineInventory_medicineId_batchNumber_key`(`medicineId`, `batchNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Prescription` (
    `id` VARCHAR(191) NOT NULL,
    `prescriptionNumber` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `doctorId` VARCHAR(191) NOT NULL,
    `appointmentId` VARCHAR(191) NULL,
    `admissionId` VARCHAR(191) NULL,
    `status` ENUM('ACTIVE', 'DISPENSED', 'PARTIALLY_DISPENSED', 'CANCELLED') NOT NULL DEFAULT 'ACTIVE',
    `notes` TEXT NULL,
    `issuedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `Prescription_prescriptionNumber_key`(`prescriptionNumber`),
    INDEX `Prescription_patientId_idx`(`patientId`),
    INDEX `Prescription_doctorId_idx`(`doctorId`),
    INDEX `Prescription_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `PrescriptionItem` (
    `id` VARCHAR(191) NOT NULL,
    `prescriptionId` VARCHAR(191) NOT NULL,
    `medicineId` VARCHAR(191) NOT NULL,
    `medicineName` VARCHAR(191) NOT NULL,
    `dosage` VARCHAR(191) NOT NULL,
    `frequency` VARCHAR(191) NOT NULL,
    `durationDays` INTEGER NOT NULL DEFAULT 5,
    `instructions` VARCHAR(191) NULL,
    `isDispensed` BOOLEAN NOT NULL DEFAULT false,
    INDEX `PrescriptionItem_prescriptionId_idx`(`prescriptionId`),
    INDEX `PrescriptionItem_medicineId_idx`(`medicineId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Service` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `category` ENUM('CONSULTATION', 'LAB', 'ROOM', 'SURGERY', 'NURSING', 'PHARMACY', 'PROCEDURE', 'EMERGENCY') NOT NULL DEFAULT 'CONSULTATION',
    `standardCost` DECIMAL(10, 2) NOT NULL,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `Service_code_key`(`code`),
    INDEX `Service_code_idx`(`code`),
    INDEX `Service_category_idx`(`category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `LabTest` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `standardFee` DECIMAL(10, 2) NOT NULL,
    `normalRange` TEXT NULL,
    `unit` VARCHAR(191) NULL,
    `turnaroundHours` INTEGER NOT NULL DEFAULT 24,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `LabTest_code_key`(`code`),
    INDEX `LabTest_code_idx`(`code`),
    INDEX `LabTest_category_idx`(`category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `LabRequest` (
    `id` VARCHAR(191) NOT NULL,
    `requestNumber` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `doctorId` VARCHAR(191) NOT NULL,
    `appointmentId` VARCHAR(191) NULL,
    `admissionId` VARCHAR(191) NULL,
    `labTestId` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'SAMPLE_COLLECTED', 'IN_ANALYSIS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `priority` ENUM('NORMAL', 'URGENT', 'EMERGENCY') NOT NULL DEFAULT 'NORMAL',
    `requestedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completedAt` DATETIME(3) NULL,
    UNIQUE INDEX `LabRequest_requestNumber_key`(`requestNumber`),
    INDEX `LabRequest_patientId_idx`(`patientId`),
    INDEX `LabRequest_doctorId_idx`(`doctorId`),
    INDEX `LabRequest_labTestId_idx`(`labTestId`),
    INDEX `LabRequest_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `LabReport` (
    `id` VARCHAR(191) NOT NULL,
    `labRequestId` VARCHAR(191) NOT NULL,
    `technicianId` VARCHAR(191) NOT NULL,
    `resultJson` TEXT NOT NULL,
    `remarks` TEXT NULL,
    `isAbnormal` BOOLEAN NOT NULL DEFAULT false,
    `reportFileUrl` VARCHAR(191) NULL,
    `verifiedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `LabReport_labRequestId_key`(`labRequestId`),
    INDEX `LabReport_technicianId_idx`(`technicianId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Bill` (
    `id` VARCHAR(191) NOT NULL,
    `billNumber` VARCHAR(191) NOT NULL,
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
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `Bill_billNumber_key`(`billNumber`),
    INDEX `Bill_patientId_idx`(`patientId`),
    INDEX `Bill_admissionId_idx`(`admissionId`),
    INDEX `Bill_appointmentId_idx`(`appointmentId`),
    INDEX `Bill_paymentStatus_idx`(`paymentStatus`),
    INDEX `Bill_billType_idx`(`billType`),
    INDEX `Bill_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `BillItem` (
    `id` VARCHAR(191) NOT NULL,
    `billId` VARCHAR(191) NOT NULL,
    `serviceId` VARCHAR(191) NULL,
    `medicineId` VARCHAR(191) NULL,
    `description` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `unitPrice` DECIMAL(10, 2) NOT NULL,
    `totalPrice` DECIMAL(10, 2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `BillItem_billId_idx`(`billId`),
    INDEX `BillItem_serviceId_idx`(`serviceId`),
    INDEX `BillItem_medicineId_idx`(`medicineId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Invoice` (
    `id` VARCHAR(191) NOT NULL,
    `invoiceNumber` VARCHAR(191) NOT NULL,
    `billId` VARCHAR(191) NOT NULL,
    `issuedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dueDate` DATETIME(3) NULL,
    `pdfUrl` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'ISSUED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `Invoice_invoiceNumber_key`(`invoiceNumber`),
    UNIQUE INDEX `Invoice_billId_key`(`billId`),
    INDEX `Invoice_invoiceNumber_idx`(`invoiceNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Payment` (
    `id` VARCHAR(191) NOT NULL,
    `receiptNumber` VARCHAR(191) NOT NULL,
    `billId` VARCHAR(191) NOT NULL,
    `cashierId` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `paymentMethod` ENUM('CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'NET_BANKING', 'INSURANCE', 'CHEQUE') NOT NULL DEFAULT 'CASH',
    `transactionRef` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'SUCCESS',
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `Payment_receiptNumber_key`(`receiptNumber`),
    INDEX `Payment_billId_idx`(`billId`),
    INDEX `Payment_patientId_idx`(`patientId`),
    INDEX `Payment_cashierId_idx`(`cashierId`),
    INDEX `Payment_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `InsuranceClaim` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `billId` VARCHAR(191) NOT NULL,
    `providerName` VARCHAR(191) NOT NULL,
    `policyNumber` VARCHAR(191) NOT NULL,
    `claimAmount` DECIMAL(10, 2) NOT NULL,
    `approvedAmount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `claimStatus` ENUM('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SETTLED') NOT NULL DEFAULT 'SUBMITTED',
    `remarks` TEXT NULL,
    `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `settledAt` DATETIME(3) NULL,
    INDEX `InsuranceClaim_patientId_idx`(`patientId`),
    INDEX `InsuranceClaim_billId_idx`(`billId`),
    INDEX `InsuranceClaim_claimStatus_idx`(`claimStatus`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Notification` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `type` ENUM('INFO', 'WARNING', 'SUCCESS', 'DANGER') NOT NULL DEFAULT 'INFO',
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `link` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `Notification_userId_idx`(`userId`),
    INDEX `Notification_isRead_idx`(`isRead`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ActivityLog` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `action` VARCHAR(191) NOT NULL,
    `entityType` VARCHAR(191) NOT NULL,
    `entityId` VARCHAR(191) NULL,
    `detailsJson` TEXT NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `ActivityLog_userId_idx`(`userId`),
    INDEX `ActivityLog_action_idx`(`action`),
    INDEX `ActivityLog_entityType_idx`(`entityType`),
    INDEX `ActivityLog_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `Permission` ADD CONSTRAINT `Permission_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Doctor` ADD CONSTRAINT `Doctor_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Doctor` ADD CONSTRAINT `Doctor_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `Staff` ADD CONSTRAINT `Staff_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Staff` ADD CONSTRAINT `Staff_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `Patient` ADD CONSTRAINT `Patient_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `Bed` ADD CONSTRAINT `Bed_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Bed` ADD CONSTRAINT `Bed_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `Admission` ADD CONSTRAINT `Admission_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Admission` ADD CONSTRAINT `Admission_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `Doctor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `Admission` ADD CONSTRAINT `Admission_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `Admission` ADD CONSTRAINT `Admission_bedId_fkey` FOREIGN KEY (`bedId`) REFERENCES `Bed`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `Doctor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `MedicalRecord` ADD CONSTRAINT `MedicalRecord_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `MedicalRecord` ADD CONSTRAINT `MedicalRecord_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `Doctor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `MedicalRecord` ADD CONSTRAINT `MedicalRecord_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `Appointment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `MedicalRecord` ADD CONSTRAINT `MedicalRecord_admissionId_fkey` FOREIGN KEY (`admissionId`) REFERENCES `Admission`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `Diagnosis` ADD CONSTRAINT `Diagnosis_medicalRecordId_fkey` FOREIGN KEY (`medicalRecordId`) REFERENCES `MedicalRecord`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `MedicineInventory` ADD CONSTRAINT `MedicineInventory_medicineId_fkey` FOREIGN KEY (`medicineId`) REFERENCES `Medicine`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Prescription` ADD CONSTRAINT `Prescription_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Prescription` ADD CONSTRAINT `Prescription_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `Doctor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `Prescription` ADD CONSTRAINT `Prescription_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `Appointment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `Prescription` ADD CONSTRAINT `Prescription_admissionId_fkey` FOREIGN KEY (`admissionId`) REFERENCES `Admission`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `PrescriptionItem` ADD CONSTRAINT `PrescriptionItem_prescriptionId_fkey` FOREIGN KEY (`prescriptionId`) REFERENCES `Prescription`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `PrescriptionItem` ADD CONSTRAINT `PrescriptionItem_medicineId_fkey` FOREIGN KEY (`medicineId`) REFERENCES `Medicine`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `LabRequest` ADD CONSTRAINT `LabRequest_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `LabRequest` ADD CONSTRAINT `LabRequest_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `Doctor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `LabRequest` ADD CONSTRAINT `LabRequest_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `Appointment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `LabRequest` ADD CONSTRAINT `LabRequest_admissionId_fkey` FOREIGN KEY (`admissionId`) REFERENCES `Admission`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `LabRequest` ADD CONSTRAINT `LabRequest_labTestId_fkey` FOREIGN KEY (`labTestId`) REFERENCES `LabTest`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `LabReport` ADD CONSTRAINT `LabReport_labRequestId_fkey` FOREIGN KEY (`labRequestId`) REFERENCES `LabRequest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `LabReport` ADD CONSTRAINT `LabReport_technicianId_fkey` FOREIGN KEY (`technicianId`) REFERENCES `Staff`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `Bill` ADD CONSTRAINT `Bill_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Bill` ADD CONSTRAINT `Bill_admissionId_fkey` FOREIGN KEY (`admissionId`) REFERENCES `Admission`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `Bill` ADD CONSTRAINT `Bill_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `Appointment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `BillItem` ADD CONSTRAINT `BillItem_billId_fkey` FOREIGN KEY (`billId`) REFERENCES `Bill`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `BillItem` ADD CONSTRAINT `BillItem_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `BillItem` ADD CONSTRAINT `BillItem_medicineId_fkey` FOREIGN KEY (`medicineId`) REFERENCES `Medicine`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_billId_fkey` FOREIGN KEY (`billId`) REFERENCES `Bill`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Payment` ADD CONSTRAINT `Payment_billId_fkey` FOREIGN KEY (`billId`) REFERENCES `Bill`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Payment` ADD CONSTRAINT `Payment_cashierId_fkey` FOREIGN KEY (`cashierId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `Payment` ADD CONSTRAINT `Payment_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `InsuranceClaim` ADD CONSTRAINT `InsuranceClaim_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `InsuranceClaim` ADD CONSTRAINT `InsuranceClaim_billId_fkey` FOREIGN KEY (`billId`) REFERENCES `Bill`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Notification` ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `ActivityLog` ADD CONSTRAINT `ActivityLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
