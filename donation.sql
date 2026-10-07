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
    expiry_window VARCHAR(100) NOT NULL,
    notes TEXT NULL,
    image_url VARCHAR(500) NULL,
    status ENUM('Pending', 'Active', 'Picked Up', 'Completed', 'Cancelled') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (donor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (food_item_id) REFERENCES food_items(id) ON DELETE SET NULL
);

-- 2. Migration statements if updating existing database:
-- ALTER TABLE donations ADD COLUMN quantity_unit VARCHAR(50) DEFAULT 'portions' AFTER quantity;
-- ALTER TABLE donations MODIFY COLUMN status VARCHAR(50) DEFAULT 'Pending';

-- 3. Insert Sample Seed Data for Donor Module Testing
INSERT INTO donations (donor_id, meal_name, quantity, quantity_unit, location, expiry_window, notes, image_url, status)
VALUES 
(1, 'Rice & Curry', '10', 'portions', 'Colombo 03, Sri Lanka', 'Today, 02:00 PM', 'Freshly prepared vegetarian rice and curry packets.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80', 'Active'),
(1, 'Sandwiches & Savories', '20', 'portions', 'Wellawatte, Sri Lanka', 'Today, 05:00 PM', 'Assorted egg and vegetable sandwiches in eco containers.', 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80', 'Picked Up'),
(1, 'Mixed Fresh Fruits', '15', 'portions', 'Nugegoda, Sri Lanka', 'Yesterday, 06:00 PM', 'Bananas, apples, and oranges.', 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=600&q=80', 'Completed'),
(1, 'Artisan Bread Packs', '12', 'boxes', 'Dehiwala, Sri Lanka', '2026-09-08', 'Fresh bakery loaves.', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80', 'Completed');
