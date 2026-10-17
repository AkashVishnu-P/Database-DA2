USE `DBMS_PROJECT`;

ALTER DATABASE `DBMS_PROJECT` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

DROP TRIGGER IF EXISTS trg_occupy_bed_on_admission;
DROP TRIGGER IF EXISTS trg_free_bed_on_discharge;
DROP TRIGGER IF EXISTS trg_update_bill_on_payment;
DROP PROCEDURE IF EXISTS sp_register_patient;
DROP PROCEDURE IF EXISTS sp_book_appointment;
DROP PROCEDURE IF EXISTS sp_admit_patient;
DROP PROCEDURE IF EXISTS sp_discharge_patient;
DROP PROCEDURE IF EXISTS sp_make_payment;
DROP FUNCTION IF EXISTS fn_get_stay_days;
DROP FUNCTION IF EXISTS fn_get_pending_balance;
DROP FUNCTION IF EXISTS fn_get_doctor_fee;

DROP PROCEDURE IF EXISTS sp_hello;
DROP PROCEDURE IF EXISTS sp_add_department;
DROP PROCEDURE IF EXISTS sp_get_patient;
DROP PROCEDURE IF EXISTS sp_doctors_in_department;
DROP PROCEDURE IF EXISTS sp_count_patients;
DROP PROCEDURE IF EXISTS sp_update_doctor_fee;
DROP PROCEDURE IF EXISTS sp_print_numbers;
DROP PROCEDURE IF EXISTS sp_list_doctors;
DROP FUNCTION IF EXISTS fn_full_name;
DROP FUNCTION IF EXISTS fn_age;
DROP FUNCTION IF EXISTS fn_patient_balance;
DROP FUNCTION IF EXISTS fn_bill_status;
DROP TRIGGER IF EXISTS trg_user_email_lowercase;
DROP TRIGGER IF EXISTS trg_patient_added_log;
DROP TRIGGER IF EXISTS trg_bill_no_negative_balance;
DROP TRIGGER IF EXISTS trg_medicine_out_of_stock;

DELIMITER $$

CREATE PROCEDURE sp_hello(IN p_name VARCHAR(100))
BEGIN
    SELECT CONCAT('Welcome to CarePulse, ', p_name) AS message;
END$$

CREATE PROCEDURE sp_add_department(
    IN p_name VARCHAR(100),
    IN p_code VARCHAR(20),
    IN p_floor VARCHAR(50)
)
BEGIN
    INSERT INTO Department (id, name, code, floor, updatedAt)
    VALUES (UUID(), p_name, p_code, p_floor, NOW());
    SELECT * FROM Department WHERE code = p_code;
END$$

CREATE PROCEDURE sp_get_patient(IN p_uhid VARCHAR(50))
BEGIN
    SELECT p.uhid, u.firstName, u.lastName, u.email, p.gender, p.bloodGroup
    FROM Patient p
    JOIN User u ON u.id = p.userId
    WHERE p.uhid = p_uhid;
END$$

CREATE PROCEDURE sp_doctors_in_department(IN p_department VARCHAR(100))
BEGIN
    SELECT u.firstName, u.lastName, d.specialization, d.consultationFee
    FROM Doctor d
    JOIN User u ON u.id = d.userId
    JOIN Department dep ON dep.id = d.departmentId
    WHERE dep.name = p_department;
END$$

CREATE PROCEDURE sp_count_patients(OUT p_total INT)
BEGIN
    SELECT COUNT(*) INTO p_total FROM Patient;
END$$

CREATE PROCEDURE sp_update_doctor_fee(IN p_license VARCHAR(50), IN p_new_fee DECIMAL(10,2))
BEGIN
    IF p_new_fee <= 0 THEN
        SELECT 'Fee must be greater than zero' AS message;
    ELSE
        UPDATE Doctor SET consultationFee = p_new_fee, updatedAt = NOW()
        WHERE licenseNumber = p_license;
        SELECT 'Fee updated' AS message;
    END IF;
END$$

CREATE PROCEDURE sp_print_numbers(IN p_limit INT)
BEGIN
    DECLARE i INT DEFAULT 1;
    DECLARE result VARCHAR(500) DEFAULT '';
    WHILE i <= p_limit DO
        SET result = CONCAT(result, i, ' ');
        SET i = i + 1;
    END WHILE;
    SELECT result AS numbers;
END$$

CREATE PROCEDURE sp_list_doctors()
BEGIN
    DECLARE done INT DEFAULT 0;
    DECLARE v_name VARCHAR(200);
    DECLARE v_list TEXT DEFAULT '';
    DECLARE doctor_cursor CURSOR FOR
        SELECT CONCAT(u.firstName, ' ', u.lastName)
        FROM Doctor d JOIN User u ON u.id = d.userId;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    OPEN doctor_cursor;
    read_loop: LOOP
        FETCH doctor_cursor INTO v_name;
        IF done = 1 THEN
            LEAVE read_loop;
        END IF;
        SET v_list = CONCAT(v_list, 'Dr. ', v_name, '; ');
    END LOOP;
    CLOSE doctor_cursor;

    SELECT v_list AS doctors;
END$$

CREATE FUNCTION fn_full_name(p_first VARCHAR(100), p_last VARCHAR(100))
RETURNS VARCHAR(201)
DETERMINISTIC
BEGIN
    RETURN CONCAT(p_first, ' ', p_last);
END$$

CREATE FUNCTION fn_age(p_dob DATETIME)
RETURNS INT
DETERMINISTIC
BEGIN
    RETURN TIMESTAMPDIFF(YEAR, p_dob, CURDATE());
END$$

CREATE FUNCTION fn_patient_balance(p_patient_id VARCHAR(191))
RETURNS DECIMAL(10,2)
READS SQL DATA
BEGIN
    DECLARE v_total DECIMAL(10,2);
    SELECT IFNULL(SUM(balanceAmount), 0) INTO v_total
    FROM Bill WHERE patientId = p_patient_id;
    RETURN v_total;
END$$

CREATE FUNCTION fn_bill_status(p_balance DECIMAL(10,2))
RETURNS VARCHAR(20)
DETERMINISTIC
BEGIN
    IF p_balance <= 0 THEN
        RETURN 'Fully Paid';
    ELSEIF p_balance < 100 THEN
        RETURN 'Small Due';
    ELSE
        RETURN 'Large Due';
    END IF;
END$$

CREATE TRIGGER trg_user_email_lowercase
BEFORE INSERT ON User
FOR EACH ROW
BEGIN
    SET NEW.email = LOWER(TRIM(NEW.email));
END$$

CREATE TRIGGER trg_patient_added_log
AFTER INSERT ON Patient
FOR EACH ROW
BEGIN
    INSERT INTO ActivityLog (id, action, entityType, entityId, detailsJson)
    VALUES (UUID(), 'PATIENT_ADDED_TRIGGER', 'Patient', NEW.id, CONCAT('{"uhid":"', NEW.uhid, '"}'));
END$$

CREATE TRIGGER trg_bill_no_negative_balance
BEFORE UPDATE ON Bill
FOR EACH ROW
BEGIN
    IF NEW.balanceAmount < 0 THEN
        SET NEW.balanceAmount = 0;
    END IF;
END$$

CREATE TRIGGER trg_medicine_out_of_stock
BEFORE UPDATE ON MedicineInventory
FOR EACH ROW
BEGIN
    IF NEW.quantityInStock <= 0 THEN
        SET NEW.quantityInStock = 0;
        SET NEW.status = 'OUT_OF_STOCK';
    END IF;
END$$

DELIMITER ;

CALL sp_hello('Admin');

CALL sp_get_patient('UHID-SQL-001');

CALL sp_doctors_in_department('ENT');

CALL sp_count_patients(@total);
SELECT @total AS totalPatients;

CALL sp_update_doctor_fee('SQL-LIC-001', 90.00);

CALL sp_print_numbers(5);

CALL sp_list_doctors();

SELECT fn_full_name(firstName, lastName) AS fullName, role FROM User;

SELECT uhid, fn_age(dateOfBirth) AS age FROM Patient;

SELECT uhid, fn_patient_balance(id) AS pendingAmount FROM Patient;

SELECT billNumber, balanceAmount, fn_bill_status(balanceAmount) AS status FROM Bill;
