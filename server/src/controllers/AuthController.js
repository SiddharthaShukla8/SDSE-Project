/**
 * AuthController.
 * Handles HTTP requests related to user authentication.
 * Delegates all logic to AuthService (SRP).
 */
class AuthController {
  /**
   * @param {import("../services/AuthService")} authService
   */
  constructor(authService) {
    this.authService = authService;
  }

  register = async (req, res, next) => {
    try {
      const result = await this.authService.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  login = async (req, res, next) => {
    try {
      const result = await this.authService.login(req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = AuthController;
