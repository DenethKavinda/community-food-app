-- =====================================================
-- Food Item Database Schema for Surplus Food App
-- =====================================================

-- 1. Create Food Items Table
CREATE TABLE IF NOT EXISTS food_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    donor_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_food_items_donor
        FOREIGN KEY (donor_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- 2. Alter Donations Table to include food_item_id reference
ALTER TABLE donations
ADD COLUMN food_item_id INT NULL AFTER donor_id;

ALTER TABLE donations
ADD CONSTRAINT fk_donations_food_item
FOREIGN KEY (food_item_id)
REFERENCES food_items(id)
ON DELETE SET NULL;
