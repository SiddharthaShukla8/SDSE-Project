const AppError = require("../utils/AppError");

/**
 * BookingService.
 * Demonstrates:
 * - High cohesion: encapsulates the complete ticket booking lifecycle
 * - Encapsulation: controls seat price calculation and booking invariants
 * - Dependency Inversion (DIP): Injected with ShowRepository, BookingRepository, PaymentContext, NotificationService
 * - Open/Closed (OCP): Works with any payment strategy provided through the PaymentContext
 */
class BookingService {
  /**
   * @param {import("../repositories/BookingRepository")} bookingRepository
   * @param {import("../repositories/ShowRepository")} showRepository
   * @param {import("../strategies/PaymentContext")} paymentContext
   * @param {import("../contracts/INotificationService")} notificationService
   */
  constructor(bookingRepository, showRepository, paymentContext, notificationService) {
    this.bookingRepository = bookingRepository;
    this.showRepository = showRepository;
    this.paymentContext = paymentContext;
    this.notificationService = notificationService;
  }

  /**
   * Calculates the accurate total price for the selected seats directly from show data.
   * Restricts client-side price tampering (Encapsulation).
   * @param {Object} show
   * @param {string[]} selectedSeats
   * @returns {number}
   */
  calculateSeatTotal(show, selectedSeats) {
    const seatMap = new Map();
    show.seats.forEach((s) => seatMap.set(s.seatNumber, s.price));

    let total = 0;
    selectedSeats.forEach((seatNum) => {
      const price = seatMap.get(seatNum);
      if (price !== undefined) {
        total += price;
      }
    });

    return total;
  }

  /**
   * Processes a ticket reservation with atomic concurrency protection and payment execution.
   */
  async createBooking({
    showId,
    seats,
    userId,
    paymentMethod = "UPI",
    paymentDetails = {},
    snacks = [],
    parking = null,
  }) {
    if (!showId || !userId) {
      throw new AppError("showId and userId are required.", 400);
    }

    if (!Array.isArray(seats) || seats.length === 0) {
      throw new AppError("At least one seat must be selected.", 400);
    }

    // 1. Fetch Show details
    const show = await this.showRepository.findById(showId);
    if (!show) {
      throw new AppError("Show not found.", 404);
    }

    // 2. Concurrency Check & Atomic Seat Locking
    // Uses atomic findOneAndUpdate to prevent double-booking race conditions
    const updatedShow = await this.showRepository.reserveSeatsAtomically(showId, seats);
    if (!updatedShow) {
      throw new AppError(
        "Seat collision detected: One or more selected seats have already been booked by another user.",
        409
      );
    }

    try {
      // 3. Encapsulated Price Calculation (prevents tampering)
      const seatTotal = this.calculateSeatTotal(show, seats);
      
      // Calculate snacks if provided
      let snacksTotal = 0;
      if (Array.isArray(snacks)) {
        snacks.forEach((snack) => {
          if (snack.qty > 0 && snack.price > 0) {
            snacksTotal += snack.price * snack.qty;
          }
        });
      }

      const parkingPrice = parking?.price || 0;
      const finalAmount = seatTotal + snacksTotal + parkingPrice;

      // 4. Polymorphic Payment Processing via Strategy Pattern
      this.paymentContext.setStrategy(paymentMethod || "UPI");
      const paymentResult = await this.paymentContext.executePayment(finalAmount, paymentDetails);

      if (!paymentResult.success) {
        // Rollback reserved seats if payment fails
        await this.showRepository.releaseSeatsAtomically(showId, seats);
        throw new AppError(`Payment failed: ${paymentResult.message}`, 402);
      }

      // 5. Create Booking Record
      const booking = await this.bookingRepository.create({
        showId,
        seats,
        userId,
        snacks,
        parking,
        totalPrice: finalAmount,
        paymentStatus: "Success",
        used: false,
        status: "VALID",
      });

      // 6. Send Notification via abstraction
      const populatedBooking = await this.bookingRepository.findWithDetails(booking._id);
      await this.notificationService.sendBookingConfirmation(
        populatedBooking.userId,
        populatedBooking
      );

      return populatedBooking;
    } catch (error) {
      // Ensure seat lock rollback on any error during booking creation
      await this.showRepository.releaseSeatsAtomically(showId, seats);
      throw error;
    }
  }

  async getUserBookings(userId) {
    if (!userId) {
      throw new AppError("User ID is required.", 400);
    }
    return await this.bookingRepository.findByUserId(userId);
  }

  async getBookingById(bookingId) {
    const booking = await this.bookingRepository.findWithDetails(bookingId);
    if (!booking) {
      throw new AppError("Booking not found.", 404);
    }
    return booking;
  }

  async markBookingAsUsed(bookingId) {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new AppError("Booking not found.", 404);
    }

    if (booking.used) {
      return { message: "Already Used", booking };
    }

    const updated = await this.bookingRepository.markAsUsed(bookingId);
    return { message: "Ticket marked as used", booking: updated };
  }
}

module.exports = BookingService;
