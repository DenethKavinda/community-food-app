CREATE TABLE IF NOT EXISTS food_bank_claims (
    id INT AUTO_INCREMENT PRIMARY KEY,
    food_bank_id INT NOT NULL,
    donation_id INT NOT NULL,
    requested_portions INT NOT NULL COMMENT 'Portions reserved from the remaining donation balance',
    fulfillment_method ENUM('Volunteer Driver Delivery', 'Self Pickup') NOT NULL,
    pickup_location VARCHAR(500) NOT NULL,
    additional_notes TEXT NULL,
    status ENUM('Pending', 'Assigned', 'Ready for Pickup', 'Completed', 'Cancelled', 'Rejected') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (food_bank_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE CASCADE
);
