const { test, describe, before, after } = require("node:test");
const assert = require("node:assert");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const createApp = require("../src/app");

describe("System Design: Concurrency & Double-Booking Stress Test", () => {
  let mongoServer;
  let services;
  let showId;
  let userId1;
  let userId2;

  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    const appInstance = createApp();
    services = appInstance.services;

    // Create Movie
    const movie = await services.movieService.createMovie({
      title: "Oppenheimer",
      description: "Biographical drama",
      duration: 180,
      poster: "https://example.com/opp.jpg",
      genre: "Drama",
    });

    // Create Show
    const show = await services.showService.createShow({
      movieId: movie._id,
      theatre: "Screen 1",
      date: "2026-12-01",
      time: "20:00",
      balconyPrice: 250,
      firstClassPrice: 180,
      secondClassPrice: 120,
    });
    showId = show._id;

    // Register 2 Users
    const u1 = await services.authService.register({
      name: "Alice",
      email: "alice@test.com",
      password: "pass",
    });
    const u2 = await services.authService.register({
      name: "Bob",
      email: "bob@test.com",
      password: "pass",
    });
    userId1 = u1.user._id;
    userId2 = u2.user._id;
  });

  after(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  test("When 2 users simultaneously attempt to book the exact same seat ('A5'), exactly one succeeds and one receives a 409 collision error", async () => {
    const targetSeat = ["A5"];

    // Trigger both promises concurrently via Promise.allSettled
    const [res1, res2] = await Promise.allSettled([
      services.bookingService.createBooking({
        showId,
        seats: targetSeat,
        userId: userId1,
        paymentMethod: "UPI",
      }),
      services.bookingService.createBooking({
        showId,
        seats: targetSeat,
        userId: userId2,
        paymentMethod: "CARD",
      }),
    ]);

    const successes = [res1, res2].filter((r) => r.status === "fulfilled");
    const rejections = [res1, res2].filter((r) => r.status === "rejected");

    assert.strictEqual(successes.length, 1, "Exactly one concurrent booking must succeed");
    assert.strictEqual(rejections.length, 1, "Exactly one concurrent booking must fail with conflict");

    const error = rejections[0].reason;
    assert.strictEqual(error.statusCode, 409);
    assert.match(error.message, /Seat collision detected/);

    // Verify DB state: seat A5 is booked once and only once
    const show = await services.showService.getShowById(showId);
    const seatA5 = show.seats.find((s) => s.seatNumber === "A5");
    assert.strictEqual(seatA5.isBooked, true);
  });
});
