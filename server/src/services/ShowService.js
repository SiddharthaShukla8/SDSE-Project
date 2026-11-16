const AppError = require("../utils/AppError");

/**
 * ShowService.
 * Handles show lifecycle, theatre seat generation, and scheduling.
 */
class ShowService {
  /**
   * @param {import("../repositories/ShowRepository")} showRepository
   * @param {import("../repositories/MovieRepository")} movieRepository
   */
  constructor(showRepository, movieRepository) {
    this.showRepository = showRepository;
    this.movieRepository = movieRepository;
  }

  /**
   * Generates a 3-tier seating matrix for a theater hall:
   * Balcony (A-D, 1-10)
   * First Class (E-H, 1-12)
   * Second Class (I-L, 1-12)
   */
  generateSeats(balconyPrice, firstPrice, secondPrice) {
    const seats = [];

    // BALCONY (A–D, 10 per row)
    ["A", "B", "C", "D"].forEach((row) => {
      for (let i = 1; i <= 10; i++) {
        seats.push({
          seatNumber: `${row}${i}`,
          category: "Balcony",
          price: Number(balconyPrice),
          isBooked: false,
        });
      }
    });

    // FIRST CLASS (E–H, 12 per row)
    ["E", "F", "G", "H"].forEach((row) => {
      for (let i = 1; i <= 12; i++) {
        seats.push({
          seatNumber: `${row}${i}`,
          category: "First Class",
          price: Number(firstPrice),
          isBooked: false,
        });
      }
    });

    // SECOND CLASS (I–L, 12 per row)
    ["I", "J", "K", "L"].forEach((row) => {
      for (let i = 1; i <= 12; i++) {
        seats.push({
          seatNumber: `${row}${i}`,
          category: "Second Class",
          price: Number(secondPrice),
          isBooked: false,
        });
      }
    });

    return seats;
  }

  async getAllShows() {
    return await this.showRepository.findAll({}, { date: 1, time: 1 });
  }

  async getShowById(showId) {
    const show = await this.showRepository.findWithMovie(showId);
    if (!show) {
      throw new AppError("Show not found", 404);
    }
    return show;
  }

  async getShowsByMovieId(movieId) {
    return await this.showRepository.findShowsByMovieId(movieId);
  }

  async createShow(showData) {
    const { movieId, theatre, date, time, balconyPrice, firstClassPrice, secondClassPrice } = showData;

    if (!movieId || !theatre || !date || !time) {
      throw new AppError("Missing mandatory show details.", 400);
    }

    // Verify referenced movie exists
    const movie = await this.movieRepository.findById(movieId);
    if (!movie) {
      throw new AppError("Referenced movie does not exist.", 404);
    }

    const bPrice = balconyPrice || 250;
    const fPrice = firstClassPrice || 180;
    const sPrice = secondClassPrice || 120;

    const seats = this.generateSeats(bPrice, fPrice, sPrice);

    return await this.showRepository.create({
      movieId,
      theatre,
      date,
      time,
      balconyPrice: bPrice,
      firstClassPrice: fPrice,
      secondClassPrice: sPrice,
      seats,
    });
  }

  async deleteShow(showId) {
    const deleted = await this.showRepository.deleteById(showId);
    if (!deleted) {
      throw new AppError("Show not found to delete.", 404);
    }
    return deleted;
  }
}

module.exports = ShowService;
