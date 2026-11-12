-- C372 Week 04 Lesson 08: extend the existing Lesson 06 database.
-- Prerequisite: petcare already contains the Lesson 06 users, pets, and journal.
-- Run this script ONCE in MySQL Workbench against your own development database.
-- It preserves existing users, pets, and journals; it does not reset any tables.
-- Do not run the full Lesson 06 or Lesson 08 db.sql again: those scripts drop tables.
--
-- If any of the three new tables already exists, STOP and inspect its schema.
-- Do not ignore table-exists errors or continue to the catalogue insert.
-- MySQL CREATE TABLE statements commit independently: a failed run may leave
-- some new tables created. Inspect the result before attempting a rerun.

USE petcare;

-- Current catalogue prices are in Singapore dollars.
CREATE TABLE services (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Store the service price at booking time, independently of later price changes.
CREATE TABLE service_bookings (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pet_id INT UNSIGNED NOT NULL,
  service_id INT UNSIGNED NOT NULL,
  booking_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  booked_price DECIMAL(10,2) NOT NULL,
  booking_date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_service_bookings_pet_id (pet_id),
  INDEX idx_service_bookings_service_id (service_id),
  CONSTRAINT fk_service_bookings_pet
    FOREIGN KEY (pet_id) REFERENCES pets(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_service_bookings_service
    FOREIGN KEY (service_id) REFERENCES services(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB;

-- A pending payment record does not mean money has been collected.
CREATE TABLE payments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  booking_id INT UNSIGNED NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  payment_reference VARCHAR(100) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_payments_booking_id (booking_id),
  CONSTRAINT fk_payments_booking
    FOREIGN KEY (booking_id) REFERENCES service_bookings(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

INSERT INTO services (name, price, is_active) VALUES
('Basic Bath', 25.00, 1),
('Full Grooming', 55.00, 1),
('Nail Trimming', 15.00, 1),
('Health Check-up', 40.00, 1),
('Vaccination', 35.00, 1),
('Dental Cleaning', 60.00, 1),
('Pet Daycare (Full Day)', 45.00, 1),
('Pet Sitting (Per Visit)', 30.00, 1);

-- Verify: eight active services; no sample bookings or payments are inserted.
SELECT id, name, price, is_active FROM services ORDER BY id;
SELECT COUNT(*) AS booking_count FROM service_bookings;
SELECT COUNT(*) AS payment_count FROM payments;

-- Clara and Mira are inherited from the supplied Lesson 06 seed data.
-- This query should show that Mira belongs to Clara if those samples remain.
SELECT u.username, p.id AS pet_id, p.name AS pet_name, p.species
FROM users AS u
JOIN pets AS p ON p.owner_id = u.id
WHERE u.username = 'clara' AND p.name = 'Mira';
