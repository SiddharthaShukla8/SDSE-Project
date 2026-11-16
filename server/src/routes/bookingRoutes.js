const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

/**
 * Factory that creates Booking routes with Injected BookingController.
 * @param {import("../controllers/BookingController")} bookingController
 */
module.exports = function createBookingRoutes(bookingController) {
  const router = express.Router();

  // QR verification route (placed before /:id)
  router.get("/verify/:id", bookingController.verifyBooking);

  // User booking endpoints
  router.post("/", authMiddleware, bookingController.bookSeats);
  router.get("/user/:userId", authMiddleware, bookingController.getUserBookings);
  router.get("/:id", authMiddleware, bookingController.getBookingById);
  router.put("/use/:id", authMiddleware, bookingController.markAsUsed);

  // Backwards compatibility endpoint for legacy parking-revenue call
  router.get("/parking-revenue", (req, res) => {
    res.json({});
  });

  return router;
};
