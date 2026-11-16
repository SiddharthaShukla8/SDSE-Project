const AppError = require("../utils/AppError");

/**
 * MovieService.
 * Handles business rules for movie management.
 * Demonstrates Dependency Inversion (depends on MovieRepository abstraction).
 */
class MovieService {
  /**
   * @param {import("../repositories/MovieRepository")} movieRepository
   */
  constructor(movieRepository) {
    this.movieRepository = movieRepository;
  }

  async getAllMovies() {
    return await this.movieRepository.findAll();
  }

  async getMovieById(id) {
    const movie = await this.movieRepository.findById(id);
    if (!movie) {
      throw new AppError("Movie not found", 404);
    }
    return movie;
  }

  async createMovie(data) {
    const { title, description, duration, poster, genre } = data;
    if (!title || !description || !duration || !poster || !genre) {
      throw new AppError("Missing required movie fields.", 400);
    }
    return await this.movieRepository.create(data);
  }

  async updateMovie(id, data) {
    const movie = await this.movieRepository.updateById(id, data);
    if (!movie) {
      throw new AppError("Movie not found to update.", 404);
    }
    return movie;
  }

  async deleteMovie(id) {
    const movie = await this.movieRepository.deleteById(id);
    if (!movie) {
      throw new AppError("Movie not found to delete.", 404);
    }
    return movie;
  }
}

module.exports = MovieService;
