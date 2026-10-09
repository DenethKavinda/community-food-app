CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipient_id INT NOT NULL,
    donation_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    event_type VARCHAR(50) NULL,
    reference_id VARCHAR(100) NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notifications_recipient
        FOREIGN KEY (recipient_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_notifications_donation
        FOREIGN KEY (donation_id)
        REFERENCES donations(id)
        ON DELETE CASCADE,

    CONSTRAINT uk_donor_notif_event
        UNIQUE (recipient_id, donation_id, event_type, reference_id)
);