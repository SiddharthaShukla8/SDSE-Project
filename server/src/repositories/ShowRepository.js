const BaseRepository = require("./BaseRepository");
const Show = require("../models/Show");

/**
 * ShowRepository.
 * Handles show data persistence and ATOMIC seat reservation to prevent race conditions.
 */
class ShowRepository extends BaseRepository {
  constructor() {
    super(Show);
  }

  async findShowsByMovieId(movieId) {
    return await this.model.find({ movieId }).populate("movieId");
  }

  async findWithMovie(showId) {
    return await this.model.findById(showId).populate("movieId");
  }

  /**
   * Concurrency Protection: Atomic Seat Reservation.
   * Uses MongoDB atomic document matching and arrayFilters.
   * Guarantees that two concurrent booking requests cannot both claim the same seat.
   *
   * @param {string} showId - Target Show ID
   * @param {string[]} seatNumbers - Array of seat numbers to reserve (e.g. ['A1', 'A2'])
   * @returns {Promise<Object|null>} Returns updated show doc if successful, null if conflict
   */
  async reserveSeatsAtomically(showId, seatNumbers) {
    // We match the show only if ALL requested seats currently have isBooked: false
    const matchCondition = {
      _id: showId,
      $and: seatNumbers.map((seatNum) => ({
        seats: {
          $elemMatch: {
            seatNumber: seatNum,
            isBooked: false,
          },
        },
      })),
    };

    const updateOperation = {
      $set: {
        "seats.$[elem].isBooked": true,
      },
    };

    const options = {
      arrayFilters: [{ "elem.seatNumber": { $in: seatNumbers } }],
      new: true,
    };

    const updatedShow = await this.model.findOneAndUpdate(
      matchCondition,
      updateOperation,
      options
    );

    return updatedShow;
  }

  /**
   * Release reserved seats (e.g., if payment or booking transaction fails).
   * @param {string} showId
   * @param {string[]} seatNumbers
   */
  async releaseSeatsAtomically(showId, seatNumbers) {
    return await this.model.findByIdAndUpdate(
      showId,
      {
        $set: { "seats.$[elem].isBooked": false },
      },
      {
        arrayFilters: [{ "elem.seatNumber": { $in: seatNumbers } }],
        new: true,
      }
    );
  }
}

module.exports = ShowRepository;
