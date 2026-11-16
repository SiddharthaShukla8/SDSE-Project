const INotificationService = require("../contracts/INotificationService");

/**
 * Simulated Notification Service.
 * Demonstrates Abstraction & Interface implementation.
 */
class NotificationService extends INotificationService {
  async sendBookingConfirmation(user, bookingDetails) {
    const userIdentifier = user?.email || user?.name || "Customer";
    console.log(
      `[NotificationService] 📧 Booking confirmation dispatched to ${userIdentifier} for booking #${bookingDetails._id || bookingDetails.id}. Seats: ${bookingDetails.seats?.join(", ")}`
    );
    return true;
  }
}

module.exports = NotificationService;
