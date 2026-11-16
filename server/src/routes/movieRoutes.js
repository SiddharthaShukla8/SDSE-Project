const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

/**
 * Factory that creates Movie routes with Injected MovieController.
 * @param {import("../controllers/MovieController")} movieController
 */
module.exports = function createMovieRoutes(movieController) {
  const router = express.Router();

  // Public routes
  router.get("/", movieController.getMovies);
  router.get("/:id", movieController.getMovie);

  // Admin routes
  router.post("/", authMiddleware, adminMiddleware, movieController.addMovie);
  router.put("/:id", authMiddleware, adminMiddleware, movieController.updateMovie);
  router.delete("/:id", authMiddleware, adminMiddleware, movieController.deleteMovie);

  return router;
};
