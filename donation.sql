-- =====================================================
-- Donor Module Database Schema for Surplus Food App
-- =====================================================
-- 1. Create Donations Table
CREATE TABLE IF NOT EXISTS donations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    donor_id INT NOT NULL,
    food_item_id INT NULL,
    meal_name VARCHAR(255) NOT NULL,
    quantity VARCHAR(100) NOT NULL,
    quantity_unit VARCHAR(50) DEFAULT 'portions',
    location VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8) NULL,
    longitude DECIMAL(11, 8) NULL,
    expiry_window VARCHAR(100) NOT NULL,
    notes TEXT NULL,
    image_url VARCHAR(500) NULL,
    status ENUM(
        'Pending',
        'Active',
        'Picked Up',
        'Completed',
        'Cancelled'
    ) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (donor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (food_item_id) REFERENCES food_items(id) ON DELETE
    SET NULL
);

-- 2. Migration statements if updating an existing database:
-- ALTER TABLE donations ADD COLUMN quantity_unit VARCHAR(50) DEFAULT 'portions' AFTER quantity;
-- ALTER TABLE donations ADD COLUMN latitude DECIMAL(10, 8) NULL AFTER location;
-- ALTER TABLE donations ADD COLUMN longitude DECIMAL(11, 8) NULL AFTER latitude;
-- ALTER TABLE donations MODIFY COLUMN status VARCHAR(50) DEFAULT 'Pending';