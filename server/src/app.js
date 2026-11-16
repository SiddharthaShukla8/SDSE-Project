const express = require("express");
const cors = require("cors");
const AppError = require("./utils/AppError");

// Repositories
const MovieRepository = require("./repositories/MovieRepository");
const ShowRepository = require("./repositories/ShowRepository");
const BookingRepository = require("./repositories/BookingRepository");

// Strategies & Notification
const PaymentContext = require("./strategies/PaymentContext");
const NotificationService = require("./services/NotificationService");

// Services
const AuthService = require("./services/AuthService");
const MovieService = require("./services/MovieService");
const ShowService = require("./services/ShowService");
const BookingService = require("./services/BookingService");

// Controllers
const AuthController = require("./controllers/AuthController");
const MovieController = require("./controllers/MovieController");
const ShowController = require("./controllers/ShowController");
const BookingController = require("./controllers/BookingController");

// Route Factories
const createAuthRoutes = require("./routes/authRoutes");
const createMovieRoutes = require("./routes/movieRoutes");
const createShowRoutes = require("./routes/showRoutes");
const createBookingRoutes = require("./routes/bookingRoutes");

/**
 * Dependency Injection (DI) Composition Root.
 * Instantiates and wires repositories, services, strategies, and controllers.
 * Demonstrates the Dependency Inversion Principle (DIP).
 */
function createApp() {
  const app = express();

  // 1. Repositories
  const movieRepository = new MovieRepository();
  const showRepository = new ShowRepository();
  const bookingRepository = new BookingRepository();

  // 2. Strategies & External Services
  const paymentContext = new PaymentContext();
  const notificationService = new NotificationService();

  // 3. Domain Services (Injected with dependencies)
  const authService = new AuthService();
  const movieService = new MovieService(movieRepository);
  const showService = new ShowService(showRepository, movieRepository);
  const bookingService = new BookingService(
    bookingRepository,
    showRepository,
    paymentContext,
    notificationService
  );

  // 4. Controllers (Injected with domain services)
  const authController = new AuthController(authService);
  const movieController = new MovieController(movieService);
  const showController = new ShowController(showService);
  const bookingController = new BookingController(bookingService);

  // ── Middlewares ─────────────────────────────────────────
  app.use(
    cors({
      origin: function (origin, callback) {
        const allowedExact = [
          "http://localhost:3000",
          "https://movie-booking-system-mern-fawn.vercel.app",
        ];
        if (!origin) return callback(null, true);
        if (allowedExact.includes(origin) || origin.endsWith(".vercel.app")) {
          return callback(null, true);
        }
        return callback(null, true); // Permissive in dev/testing
      },
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  );

  app.use(express.json());

  // ── Health Check ────────────────────────────────────────
  app.get("/", (req, res) => {
    res.json({
      status: "ok",
      message: "CineBook API running with Clean Architecture & OOP/SOLID principles 🎬",
    });
  });

  // ── Core Domain Routes ──────────────────────────────────
  app.use("/api/auth", createAuthRoutes(authController));
  app.use("/api/movies", createMovieRoutes(movieController));
  app.use("/api/shows", createShowRoutes(showController));
  app.use("/api/bookings", createBookingRoutes(bookingController));

  // ── Simplified Graceful Fallback Routes for Deprecated Features ──
  // Keeps frontend safe if any lingering AddOn/Parking/Coupon call is triggered
  app.get("/api/snacks*", (req, res) => res.json([]));
  app.post("/api/snacks*", (req, res) => res.json([]));
  app.get("/api/parking*", (req, res) => res.json(null));
  app.get("/api/coupons*", (req, res) => res.json([]));
  app.get("/api/analytics*", (req, res) => res.json({ totalRevenue: 0, totalBookings: 0 }));
  app.get("/api/reviews*", (req, res) => res.json([]));

  // ── 404 Handler ─────────────────────────────────────────
  app.use((req, res, next) => {
    next(new AppError(`Endpoint not found: ${req.originalUrl}`, 404));
  });

  // ── Centralized Error Handling Middleware ───────────────
  app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    if (process.env.NODE_ENV !== "test" && statusCode === 500) {
      console.error("[ServerError]", err);
    }

    res.status(statusCode).json({
      success: false,
      message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  });

  return {
    app,
    services: {
      authService,
      movieService,
      showService,
      bookingService,
    },
    repositories: {
      movieRepository,
      showRepository,
      bookingRepository,
    },
    paymentContext,
  };
}

module.exports = createApp;
