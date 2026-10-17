USE `DBMS_PROJECT`;

INSERT IGNORE INTO Department (id, name, code, floor, contactNumber, updatedAt) VALUES
('sql-dept-ent', 'ENT', 'ENT', '1st Floor', 'ext-201', NOW()),
('sql-dept-eye', 'Ophthalmology', 'OPTH', '2nd Floor', 'ext-202', NOW()),
('sql-dept-phy', 'Physiotherapy', 'PHYS', 'Ground Floor', 'ext-203', NOW());

INSERT IGNORE INTO User (id, email, passwordHash, role, firstName, lastName, phone, updatedAt) VALUES
('sql-user-d1', 'meena.doctor@sample.com', '$2a$10$yx5iROi1JbXc7TpxYuI0dubt1kAwYwS9LYJrtzKiylK0PU4eiGm.6', 'DOCTOR', 'Meena', 'Iyer', '9000000001', NOW()),
('sql-user-d2', 'ravi.doctor@sample.com', '$2a$10$yx5iROi1JbXc7TpxYuI0dubt1kAwYwS9LYJrtzKiylK0PU4eiGm.6', 'DOCTOR', 'Ravi', 'Shankar', '9000000002', NOW()),
('sql-user-p1', 'kavin.patient@sample.com', '$2a$10$yx5iROi1JbXc7TpxYuI0dubt1kAwYwS9LYJrtzKiylK0PU4eiGm.6', 'PATIENT', 'Kavin', 'Kumar', '9000000003', NOW()),
('sql-user-p2', 'divya.patient@sample.com', '$2a$10$yx5iROi1JbXc7TpxYuI0dubt1kAwYwS9LYJrtzKiylK0PU4eiGm.6', 'PATIENT', 'Divya', 'Raman', '9000000004', NOW()),
('sql-user-p3', 'arjun.patient@sample.com', '$2a$10$yx5iROi1JbXc7TpxYuI0dubt1kAwYwS9LYJrtzKiylK0PU4eiGm.6', 'PATIENT', 'Arjun', 'Das', '9000000005', NOW());

INSERT IGNORE INTO Doctor (id, userId, departmentId, licenseNumber, specialization, qualification, experienceYears, consultationFee, updatedAt) VALUES
('sql-doc-1', 'sql-user-d1', 'sql-dept-ent', 'SQL-LIC-001', 'ENT Surgeon', 'MBBS, MS', 8, 80.00, NOW()),
('sql-doc-2', 'sql-user-d2', 'sql-dept-eye', 'SQL-LIC-002', 'Eye Specialist', 'MBBS, DO', 12, 100.00, NOW());

INSERT IGNORE INTO Patient (id, userId, uhid, bloodGroup, dateOfBirth, gender, city, updatedAt) VALUES
('sql-pat-1', 'sql-user-p1', 'UHID-SQL-001', 'O+', '1998-03-10', 'Male', 'Erode', NOW()),
('sql-pat-2', 'sql-user-p2', 'UHID-SQL-002', 'A+', '2001-07-22', 'Female', 'Salem', NOW()),
('sql-pat-3', 'sql-user-p3', 'UHID-SQL-003', 'B+', '1975-11-05', 'Male', 'Coimbatore', NOW());

INSERT IGNORE INTO Room (id, roomNumber, type, floor, dailyRate, capacity, updatedAt) VALUES
('sql-room-1', 'S-101', 'GENERAL_WARD', '1st Floor', 800.00, 2, NOW()),
('sql-room-2', 'S-201', 'PRIVATE', '2nd Floor', 2500.00, 1, NOW());

INSERT IGNORE INTO Bed (id, bedNumber, roomId, updatedAt) VALUES
('sql-bed-1', 'S-101-A', 'sql-room-1', NOW()),
('sql-bed-2', 'S-101-B', 'sql-room-1', NOW()),
('sql-bed-3', 'S-201-A', 'sql-room-2', NOW());

INSERT IGNORE INTO Medicine (id, code, name, genericName, category, form, strength, manufacturer, unitPrice, reorderLevel, updatedAt) VALUES
('sql-med-1', 'SMP-001', 'Dolo', 'Paracetamol', 'Analgesic', 'TABLET', '650mg', 'Micro Labs', 2.00, 50, NOW()),
('sql-med-2', 'SMP-002', 'Cetzine', 'Cetirizine', 'Antihistamine', 'TABLET', '10mg', 'GSK', 1.50, 40, NOW());

INSERT IGNORE INTO MedicineInventory (id, medicineId, batchNumber, expiryDate, quantityInStock, purchasePrice, sellingPrice, updatedAt) VALUES
('sql-inv-1', 'sql-med-1', 'B-001', '2028-12-31', 200, 1.20, 2.00, NOW()),
('sql-inv-2', 'sql-med-2', 'B-002', '2028-06-30', 30, 0.80, 1.50, NOW());

INSERT IGNORE INTO Appointment (id, appointmentNumber, patientId, doctorId, departmentId, appointmentDate, timeSlot, tokenNumber, status, updatedAt) VALUES
('sql-apt-1', 'APT-SQL-001', 'sql-pat-1', 'sql-doc-1', 'sql-dept-ent', NOW(), '10:00 AM', 1, 'SCHEDULED', NOW()),
('sql-apt-2', 'APT-SQL-002', 'sql-pat-2', 'sql-doc-2', 'sql-dept-eye', NOW(), '11:00 AM', 1, 'COMPLETED', NOW()),
('sql-apt-3', 'APT-SQL-003', 'sql-pat-3', 'sql-doc-1', 'sql-dept-ent', NOW(), '11:30 AM', 2, 'SCHEDULED', NOW());

INSERT IGNORE INTO Bill (id, billNumber, patientId, appointmentId, billType, totalAmount, netAmount, paidAmount, balanceAmount, paymentStatus, updatedAt) VALUES
('sql-bill-1', 'BILL-SQL-001', 'sql-pat-1', 'sql-apt-1', 'OUTPATIENT', 80.00, 80.00, 0.00, 80.00, 'PENDING', NOW()),
('sql-bill-2', 'BILL-SQL-002', 'sql-pat-2', 'sql-apt-2', 'OUTPATIENT', 100.00, 100.00, 100.00, 0.00, 'PAID', NOW()),
('sql-bill-3', 'BILL-SQL-003', 'sql-pat-3', 'sql-apt-3', 'OUTPATIENT', 80.00, 80.00, 30.00, 50.00, 'PARTIALLY_PAID', NOW());
