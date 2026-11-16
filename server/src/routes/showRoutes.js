const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

/**
 * Factory that creates Show routes with Injected ShowController.
 * @param {import("../controllers/ShowController")} showController
 */
module.exports = function createShowRoutes(showController) {
  const router = express.Router();

  // Public routes
  router.get("/", showController.getShows);
  router.get("/movie/:movieId", showController.getShowsByMovie);
  router.get("/single/:id", showController.getShow);
  router.get("/:id", showController.getShow);

  // Admin routes
  router.post("/", authMiddleware, adminMiddleware, showController.addShow);
  router.delete("/:id", authMiddleware, adminMiddleware, showController.deleteShow);

  return router;
};
