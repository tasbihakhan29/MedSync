-- ============================================================
-- MedSync City - MySQL Database Schema
-- Run this file BEFORE starting the Spring Boot application
-- ============================================================

CREATE DATABASE IF NOT EXISTS medsync_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE medsync_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role ENUM('CITY_ADMIN', 'HOSPITAL', 'PHARMACY') NOT NULL,
    status ENUM('PENDING', 'ACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'PENDING',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Hospitals / Pharmacies table
CREATE TABLE IF NOT EXISTS hospitals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    hospital_name VARCHAR(150) NOT NULL,
    address TEXT NOT NULL,
    license_number VARCHAR(100) NOT NULL UNIQUE,
    contact_phone VARCHAR(20),
    contact_email VARCHAR(100),
    latitude DOUBLE,
    longitude DOUBLE,
    share_expiry_alerts BOOLEAN DEFAULT FALSE,
    type ENUM('HOSPITAL', 'PHARMACY') NOT NULL DEFAULT 'HOSPITAL',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Medicines master table
CREATE TABLE IF NOT EXISTS medicines (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    generic_name VARCHAR(200),
    manufacturer VARCHAR(150),
    category VARCHAR(100),
    description TEXT,
    barcode VARCHAR(100) UNIQUE,
    unit VARCHAR(50) NOT NULL,
    approval_status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    added_by BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Medicine batches (inventory per hospital)
CREATE TABLE IF NOT EXISTS medicine_batches (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    medicine_id BIGINT NOT NULL,
    hospital_id BIGINT NOT NULL,
    batch_number VARCHAR(100) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    expiry_date DATE NOT NULL,
    manufacture_date DATE,
    purchase_price DECIMAL(10,2),
    expiry_status ENUM('GOOD', 'NEAR_EXPIRY', 'CRITICAL', 'EXPIRED') DEFAULT 'GOOD',
    share_alert BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id),
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
    INDEX idx_hospital_medicine (hospital_id, medicine_id),
    INDEX idx_expiry_date (expiry_date),
    INDEX idx_share_alert (share_alert)
);

-- Medicine transfer requests
CREATE TABLE IF NOT EXISTS medicine_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    requester_id BIGINT NOT NULL,
    supplier_id BIGINT,
    medicine_id BIGINT NOT NULL,
    quantity_requested INT NOT NULL,
    quantity_approved INT,
    urgency ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM',
    status ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    request_note TEXT,
    response_note TEXT,
    tracking_code VARCHAR(50) UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_id) REFERENCES hospitals(id),
    FOREIGN KEY (supplier_id) REFERENCES hospitals(id),
    FOREIGN KEY (medicine_id) REFERENCES medicines(id),
    INDEX idx_status (status),
    INDEX idx_requester (requester_id),
    INDEX idx_supplier (supplier_id)
);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id BIGINT,
    details TEXT,
    ip_address VARCHAR(45),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_created_at (created_at)
);

-- ============================================================
-- Sample Data
-- ============================================================

-- Default admin (password: Admin@123)
INSERT IGNORE INTO users (username, password, email, role, status)
VALUES ('admin', '$2a$10$N.zmdr9k8eq2P7MYCpVpNurRpPiH/jNOJFpbOVGxTp0SRQf4ymGXy', 
        'admin@medsync.city', 'CITY_ADMIN', 'ACTIVE');

-- Sample approved medicines
INSERT IGNORE INTO medicines (name, generic_name, manufacturer, category, unit, approval_status, barcode)
VALUES 
  ('Paracetamol 500mg', 'Acetaminophen', 'Sun Pharma', 'Analgesic', 'Tablets', 'APPROVED', 'BAR001'),
  ('Amoxicillin 500mg', 'Amoxicillin', 'Cipla', 'Antibiotic', 'Capsules', 'APPROVED', 'BAR002'),
  ('Metformin 500mg', 'Metformin HCl', 'Dr. Reddys', 'Antidiabetic', 'Tablets', 'APPROVED', 'BAR003'),
  ('Atorvastatin 20mg', 'Atorvastatin', 'Zydus', 'Antilipemic', 'Tablets', 'APPROVED', 'BAR004'),
  ('Cetirizine 10mg', 'Cetirizine HCl', 'Mankind', 'Antihistamine', 'Tablets', 'APPROVED', 'BAR005'),
  ('Omeprazole 20mg', 'Omeprazole', 'Lupin', 'Proton Pump Inhibitor', 'Capsules', 'APPROVED', 'BAR006'),
  ('Amlodipine 5mg', 'Amlodipine', 'Torrent', 'Antihypertensive', 'Tablets', 'APPROVED', 'BAR007'),
  ('Azithromycin 500mg', 'Azithromycin', 'Macleods', 'Antibiotic', 'Tablets', 'APPROVED', 'BAR008');

-- ============================================================
-- Done! Now update application.properties with your DB creds
-- and run: mvn spring-boot:run
-- ============================================================
