CREATE TABLE IF NOT EXISTS requests (
    id INT AUTO_INCREMENT PRIMARY KEY,

    donation_id INT NOT NULL,
    recipient_id INT NOT NULL,

    requested_portions INT NOT NULL,

    fulfillment_method ENUM(
        'Volunteer Driver Delivery',
        'Self Pickup'
    ) NOT NULL,

    delivery_address VARCHAR(500) NULL,
    contact_phone VARCHAR(20) NOT NULL,

    special_instructions TEXT NULL,

    status ENUM(
        'Pending',
        'Approved',
        'Rejected',
        'Cancelled',
        'Completed'
    ) DEFAULT 'Pending',

    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (donation_id)
        REFERENCES donations(id)
        ON DELETE CASCADE,

    FOREIGN KEY (recipient_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

ALTER TABLE requests
ADD COLUMN delivery_latitude DECIMAL(10, 8) NULL,
ADD COLUMN delivery_longitude DECIMAL(11, 8) NULL;