USE `DBMS_PROJECT`;

SHOW TABLES;

DESC Patient;

SELECT * FROM Department;

SELECT firstName, lastName, email, role FROM User;

SELECT firstName, lastName FROM User WHERE role = 'DOCTOR';

SELECT uhid, gender, bloodGroup FROM Patient WHERE gender = 'Female';

SELECT uhid, bloodGroup FROM Patient WHERE bloodGroup IN ('O+', 'O-');

SELECT name, unitPrice FROM Medicine WHERE unitPrice BETWEEN 1 AND 20;

SELECT firstName, lastName FROM User WHERE firstName LIKE 'A%';

SELECT name, unitPrice FROM Medicine ORDER BY unitPrice DESC;

SELECT name, unitPrice FROM Medicine ORDER BY unitPrice DESC LIMIT 3;

SELECT DISTINCT city FROM Patient WHERE city IS NOT NULL;

SELECT COUNT(*) AS totalPatients FROM Patient;

SELECT COUNT(*) AS totalDoctors FROM Doctor;

SELECT SUM(amount) AS totalCollected FROM Payment;

SELECT AVG(consultationFee) AS averageFee FROM Doctor;

SELECT MAX(dailyRate) AS highestRoomRate, MIN(dailyRate) AS lowestRoomRate FROM Room;

SELECT role, COUNT(*) AS users FROM User GROUP BY role;

SELECT paymentStatus, COUNT(*) AS bills FROM Bill GROUP BY paymentStatus;

SELECT gender, COUNT(*) AS patients FROM Patient GROUP BY gender HAVING COUNT(*) > 1;

SELECT u.firstName, u.lastName, p.uhid, p.bloodGroup
FROM Patient p
JOIN User u ON u.id = p.userId;

SELECT u.firstName, u.lastName, d.specialization, dep.name AS department
FROM Doctor d
JOIN User u ON u.id = d.userId
JOIN Department dep ON dep.id = d.departmentId;

SELECT p.uhid, a.appointmentNumber, a.timeSlot, a.status
FROM Appointment a
JOIN Patient p ON p.id = a.patientId;

SELECT b.billNumber, p.uhid, b.netAmount, b.balanceAmount
FROM Bill b
JOIN Patient p ON p.id = b.patientId
WHERE b.paymentStatus <> 'PAID';

SELECT dep.name, COUNT(d.id) AS doctors
FROM Department dep
LEFT JOIN Doctor d ON d.departmentId = dep.id
GROUP BY dep.name;

SELECT r.roomNumber, b.bedNumber, b.status
FROM Bed b
JOIN Room r ON r.id = b.roomId
WHERE b.isOccupied = 0;

SELECT uhid FROM Patient
WHERE id IN (SELECT patientId FROM Bill WHERE paymentStatus = 'PENDING');

SELECT name FROM Medicine
WHERE unitPrice > (SELECT AVG(unitPrice) FROM Medicine);

INSERT INTO Department (id, name, code, floor, updatedAt)
VALUES (UUID(), 'Dental Care', 'DENT', '3rd Floor', NOW());

UPDATE Department SET floor = '4th Floor' WHERE code = 'DENT';

SELECT * FROM Department WHERE code = 'DENT';

DELETE FROM Department WHERE code = 'DENT';

CREATE OR REPLACE VIEW vw_patient_list AS
SELECT p.uhid, u.firstName, u.lastName, u.email, p.gender, p.bloodGroup
FROM Patient p
JOIN User u ON u.id = p.userId;

SELECT * FROM vw_patient_list;

CREATE OR REPLACE VIEW vw_doctor_list AS
SELECT u.firstName, u.lastName, d.specialization, d.consultationFee
FROM Doctor d
JOIN User u ON u.id = d.userId;

SELECT * FROM vw_doctor_list;
