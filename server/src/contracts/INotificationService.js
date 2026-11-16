/**
 * INotificationService Contract (Abstract Base Class).
 * Demonstrates Abstraction & Interface Segregation.
 */
class INotificationService {
  /**
   * Sends a booking confirmation notification to the user.
   * @param {Object} user - User information (email, name)
   * @param {Object} bookingDetails - Booking details (seats, movie, showtime, amount)
   * @returns {Promise<boolean>}
   */
  async sendBookingConfirmation(user, bookingDetails) {
    throw new Error("Method 'sendBookingConfirmation(user, bookingDetails)' must be implemented.");
  }
}

module.exports = INotificationService;
