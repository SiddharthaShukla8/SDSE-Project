const BaseRepository = require("./BaseRepository");
const Booking = require("../models/Booking");

/**
 * BookingRepository.
 * Handles database operations for customer ticket bookings.
 */
class BookingRepository extends BaseRepository {
  constructor() {
    super(Booking);
  }

  async findByUserId(userId) {
    return await this.model
      .find({ userId })
      .populate({
        path: "showId",
        populate: { path: "movieId" },
      })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
  }

  async findWithDetails(bookingId) {
    return await this.model
      .findById(bookingId)
      .populate({
        path: "showId",
        populate: { path: "movieId" },
      })
      .populate("userId", "name email");
  }

  async markAsUsed(bookingId) {
    return await this.model.findByIdAndUpdate(
      bookingId,
      { used: true, status: "USED" },
      { new: true }
    );
  }
}

module.exports = BookingRepository;
