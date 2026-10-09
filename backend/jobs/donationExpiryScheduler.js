const { checkAndNotifyExpiredDonations } = require("../services/donorNotificationService");

let intervalId = null;

function initDonationExpiryScheduler() {
  console.log("🌱 Initializing Donor Donation Expiration Background Scheduler...");

  // Run initial scan once backend starts
  setTimeout(() => {
    checkAndNotifyExpiredDonations().catch((err) =>
      console.error("Initial expiry check failed:", err.message)
    );
  }, 3000);

  // Run periodic background scan every 3 minutes (180,000 ms)
  if (!intervalId) {
    intervalId = setInterval(() => {
      checkAndNotifyExpiredDonations().catch((err) =>
        console.error("Periodic expiry check failed:", err.message)
      );
    }, 3 * 60 * 1000);
  }
}

module.exports = { initDonationExpiryScheduler };
