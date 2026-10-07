CREATE TABLE driver_tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,

    driver_id INT NULL,

    task_type ENUM('FOOD_BANK', 'RECIPIENT') NOT NULL,

    claim_id INT NULL,
    request_id INT NULL,

    donation_id INT NOT NULL,

    pickup_address VARCHAR(500) NULL,
    pickup_latitude DECIMAL(10,8) NULL,
    pickup_longitude DECIMAL(11,8) NULL,

    destination_address VARCHAR(500) NULL,
    destination_latitude DECIMAL(10,8) NULL,
    destination_longitude DECIMAL(11,8) NULL,

    status ENUM(
        'AVAILABLE',
        'ACCEPTED',
        'PICKED_UP',
        'DELIVERED',
        'CANCELLED'
    ) DEFAULT 'AVAILABLE',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE CASCADE,
    FOREIGN KEY (claim_id) REFERENCES food_bank_claims(id) ON DELETE CASCADE,
    FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE
);