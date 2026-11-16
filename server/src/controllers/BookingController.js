/**
 * BookingController.
 * Handles HTTP requests related to seat booking and user reservations.
 * Delegates all business logic to BookingService (SRP).
 */
class BookingController {
  /**
   * @param {import("../services/BookingService")} bookingService
   */
  constructor(bookingService) {
    this.bookingService = bookingService;
  }

  bookSeats = async (req, res, next) => {
    try {
      const { showId, seats, userId, paymentMethod, paymentDetails, snacks, parking } = req.body;
      
      const booking = await this.bookingService.createBooking({
        showId,
        seats,
        userId: userId || req.user?.id || req.user?._id,
        paymentMethod,
        paymentDetails,
        snacks,
        parking,
      });

      res.status(201).json(booking);
    } catch (error) {
      next(error);
    }
  };

  getUserBookings = async (req, res, next) => {
    try {
      const userId = req.params.userId || req.user?.id || req.user?._id;
      const bookings = await this.bookingService.getUserBookings(userId);
      res.json(bookings);
    } catch (error) {
      next(error);
    }
  };

  getBookingById = async (req, res, next) => {
    try {
      const booking = await this.bookingService.getBookingById(req.params.id);
      res.json(booking);
    } catch (error) {
      next(error);
    }
  };

  markAsUsed = async (req, res, next) => {
    try {
      const result = await this.bookingService.markBookingAsUsed(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  verifyBooking = async (req, res, next) => {
    try {
      const booking = await this.bookingService.getBookingById(req.params.id);
      res.json(booking);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = BookingController;
