-- 1. Users Table (Supports 5 distinct roles)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('DONOR', 'RECIPIENT', 'DRIVER', 'FOOD_BANK', 'ADMIN') NOT NULL,
    phone VARCHAR(20),
    address VARCHAR(255),
    license_number VARCHAR(50) NULL, -- For DRIVER role verification
    organization_name VARCHAR(100) NULL, -- For FOOD_BANK role
    is_approved TINYINT(1) DEFAULT 1, -- Set to 0 if Driver/Food Bank needs Admin approval
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Insert Default System Admin
-- Default Login: admin@foodbank.com / Admin123!
INSERT INTO users (name, email, password, role, is_approved) 
VALUES (
    'System Administrator', 
    'admin@foodbank.com', 
    '$2a$10$8v/56P42d9hT0s6.yA1e,eGkMkJk.M5h6E.O4eM8u8a8x8q8a8q8a', -- Pre-hashed 'Admin123!'
    'ADMIN', 
    1
);

ALTER TABLE users ADD COLUMN nic VARCHAR(20) NOT NULL AFTER name;

ALTER TABLE users 
ADD COLUMN register_number VARCHAR(50) NULL AFTER organization_name;



-- Update Admin account with the valid bcrypt hash
UPDATE users 
SET password = '$2b$10$s0mN5i4IFRufhAYLTR8mTOVxnk3fvIg0gGKYKyYvkTyc.Qvel6wBW' 
WHERE email = 'admin@foodbank.com';


SELECT id, name, email, role, is_approved FROM users WHERE email = 'admin@foodbank.com';

