/**
 * ShowController.
 * Handles HTTP requests related to shows and seat maps.
 * Delegates all logic to ShowService (SRP).
 */
class ShowController {
  /**
   * @param {import("../services/ShowService")} showService
   */
  constructor(showService) {
    this.showService = showService;
  }

  getShows = async (req, res, next) => {
    try {
      const shows = await this.showService.getAllShows();
      res.json(shows);
    } catch (error) {
      next(error);
    }
  };

  getShow = async (req, res, next) => {
    try {
      const show = await this.showService.getShowById(req.params.id);
      res.json(show);
    } catch (error) {
      next(error);
    }
  };

  getShowsByMovie = async (req, res, next) => {
    try {
      const shows = await this.showService.getShowsByMovieId(req.params.movieId);
      res.json(shows);
    } catch (error) {
      next(error);
    }
  };

  addShow = async (req, res, next) => {
    try {
      const show = await this.showService.createShow(req.body);
      res.status(201).json(show);
    } catch (error) {
      next(error);
    }
  };

  deleteShow = async (req, res, next) => {
    try {
      const deleted = await this.showService.deleteShow(req.params.id);
      res.json({ message: "Show deleted successfully", show: deleted });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = ShowController;
