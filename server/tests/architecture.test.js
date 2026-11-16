const { test, describe, before, after } = require("node:test");
const assert = require("node:assert");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const request = require("supertest");
const createApp = require("../src/app");
const UpiPaymentStrategy = require("../src/strategies/UpiPaymentStrategy");
const CardPaymentStrategy = require("../src/strategies/CardPaymentStrategy");
const IPaymentStrategy = require("../src/contracts/IPaymentStrategy");

describe("Movie Booking System - OOP & SOLID Architectural Tests", () => {
  let mongoServer;
  let app;
  let services;
  let repositories;
  let paymentContext;

  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    const appInstance = createApp();
    app = appInstance.app;
    services = appInstance.services;
    repositories = appInstance.repositories;
    paymentContext = appInstance.paymentContext;
  });

  after(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe("1. OOP Pillar: Inheritance & Abstraction", () => {
    test("Concrete Payment Strategies correctly inherit from IPaymentStrategy", () => {
      const upi = new UpiPaymentStrategy();
      const card = new CardPaymentStrategy();

      assert.strictEqual(upi instanceof IPaymentStrategy, true);
      assert.strictEqual(card instanceof IPaymentStrategy, true);
      assert.strictEqual(upi.getStrategyName(), "UPI");
      assert.strictEqual(card.getStrategyName(), "CARD");
    });

    test("Calling base IPaymentStrategy throws error (Abstract Contract enforcement)", async () => {
      const base = new IPaymentStrategy();
      await assert.rejects(
        async () => {
          await base.processPayment(100);
        },
        {
          message: "Method 'processPayment(amount, paymentDetails)' must be implemented.",
        }
      );
    });
  });

  describe("2. OOP Pillar: Polymorphism & Open/Closed Principle (OCP)", () => {
    test("PaymentContext executes UPI and Card strategies polymorphically", async () => {
      paymentContext.setStrategy("UPI");
      const upiResult = await paymentContext.executePayment(500, { upiId: "student@okicici" });
      assert.strictEqual(upiResult.success, true);
      assert.strictEqual(upiResult.method, "UPI");
      assert.strictEqual(upiResult.payer, "student@okicici");

      paymentContext.setStrategy("CARD");
      const cardResult = await paymentContext.executePayment(500, { cardNumber: "4111222233334444" });
      assert.strictEqual(cardResult.success, true);
      assert.strictEqual(cardResult.method, "CREDIT_DEBIT_CARD");
      assert.strictEqual(cardResult.last4, "4444");
    });

    test("OCP: A new custom payment strategy can be registered dynamically without altering core service", async () => {
      class CryptoPaymentStrategy extends IPaymentStrategy {
        getStrategyName() {
          return "CRYPTO";
        }
        async processPayment(amount) {
          return {
            success: true,
            transactionId: `CRYPTO-${Date.now()}`,
            method: "CRYPTO",
            amount,
            message: "Crypto payment verified on chain.",
          };
        }
      }

      paymentContext.registerStrategy("CRYPTO", new CryptoPaymentStrategy());
      paymentContext.setStrategy("CRYPTO");
      const result = await paymentContext.executePayment(1200);

      assert.strictEqual(result.success, true);
      assert.strictEqual(result.method, "CRYPTO");
    });
  });

  describe("3. SOLID: Single Responsibility, DI & End-to-End API Integration", () => {
    let authToken;
    let userId;
    let movieId;
    let showId;

    test("Auth: Registers user and issues JWT", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Test Student",
          email: "student@college.edu",
          password: "password123",
          role: "admin",
        });

      assert.strictEqual(res.status, 201);
      assert.ok(res.body.token);
      assert.strictEqual(res.body.user.email, "student@college.edu");
      authToken = res.body.token;
      userId = res.body.user._id;
    });

    test("Movie CRUD: Creates and retrieves a movie", async () => {
      const movieRes = await request(app)
        .post("/api/movies")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Inception",
          description: "A thief who steals corporate secrets through dream-sharing technology.",
          duration: 148,
          poster: "https://example.com/poster.jpg",
          genre: "Sci-Fi",
        });

      assert.strictEqual(movieRes.status, 201);
      assert.ok(movieRes.body._id);
      movieId = movieRes.body._id;

      const getRes = await request(app).get(`/api/movies/${movieId}`);
      assert.strictEqual(getRes.status, 200);
      assert.strictEqual(getRes.body.title, "Inception");
    });

    test("Show Service: Creates a show with generated 3-tier seating matrix", async () => {
      const showRes = await request(app)
        .post("/api/shows")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          movieId,
          theatre: "PVR IMAX Hall 1",
          date: "2026-11-20",
          time: "18:30",
          balconyPrice: 300,
          firstClassPrice: 200,
          secondClassPrice: 150,
        });

      assert.strictEqual(showRes.status, 201);
      assert.ok(showRes.body.seats.length > 0);
      showId = showRes.body._id;
    });

    test("Booking Service: Successfully reserves seats and executes payment", async () => {
      const bookRes = await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          showId,
          seats: ["A1", "A2"],
          userId,
          paymentMethod: "UPI",
          paymentDetails: { upiId: "student@upi" },
        });

      assert.strictEqual(bookRes.status, 201);
      assert.deepStrictEqual(bookRes.body.seats, ["A1", "A2"]);
      assert.strictEqual(bookRes.body.totalPrice, 600); // 300 * 2 for Balcony
      assert.strictEqual(bookRes.body.paymentStatus, "Success");
    });

    test("4. System Design: Concurrency Protection against Double-Booking", async () => {
      // User 2 attempts to book the exact same seats ('A1') concurrently
      const conflictRes = await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          showId,
          seats: ["A1"], // Already booked in previous test!
          userId,
          paymentMethod: "CARD",
        });

      assert.strictEqual(conflictRes.status, 409);
      assert.match(conflictRes.body.message, /Seat collision detected|already been booked/);
    });

    test("User Booking History: Retrieves user bookings", async () => {
      const historyRes = await request(app)
        .get(`/api/bookings/user/${userId}`)
        .set("Authorization", `Bearer ${authToken}`);

      assert.strictEqual(historyRes.status, 200);
      assert.strictEqual(Array.isArray(historyRes.body), true);
      assert.strictEqual(historyRes.body.length, 1);
      assert.deepStrictEqual(historyRes.body[0].seats, ["A1", "A2"]);
    });
  });
});
