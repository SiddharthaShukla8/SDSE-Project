/**
 * MovieController.
 * Handles HTTP requests related to movies.
 * Delegates all logic to MovieService (SRP).
 */
class MovieController {
  /**
   * @param {import("../services/MovieService")} movieService
   */
  constructor(movieService) {
    this.movieService = movieService;
  }

  getMovies = async (req, res, next) => {
    try {
      const movies = await this.movieService.getAllMovies();
      res.json(movies);
    } catch (error) {
      next(error);
    }
  };

  getMovie = async (req, res, next) => {
    try {
      const movie = await this.movieService.getMovieById(req.params.id);
      res.json(movie);
    } catch (error) {
      next(error);
    }
  };

  addMovie = async (req, res, next) => {
    try {
      const movie = await this.movieService.createMovie(req.body);
      res.status(201).json(movie);
    } catch (error) {
      next(error);
    }
  };

  updateMovie = async (req, res, next) => {
    try {
      const movie = await this.movieService.updateMovie(req.params.id, req.body);
      res.json(movie);
    } catch (error) {
      next(error);
    }
  };

  deleteMovie = async (req, res, next) => {
    try {
      const deleted = await this.movieService.deleteMovie(req.params.id);
      res.json({ message: "Movie deleted successfully", movie: deleted });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = MovieController;
