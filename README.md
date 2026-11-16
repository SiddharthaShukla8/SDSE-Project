# 🎬 CineBook: Clean Architecture Movie Booking System (MERN)
*College Capstone System Design & OOP/SOLID Engineering Evaluation*

---

## 📌 Executive Summary

**CineBook** is an enterprise-grade, clean-architecture movie ticket booking application developed with the MERN stack (MongoDB, Express.js, React.js, Node.js). 

This project was comprehensively refactored from a procedural codebase to demonstrate:
1. **All 4 Pillars of Object-Oriented Programming (OOP)**: Encapsulation, Abstraction, Inheritance, and Polymorphism.
2. **All 5 SOLID Principles**: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion.
3. **Key System Design Patterns**: Layered Architecture, Repository Pattern, Strategy Pattern, and Dependency Injection.
4. **Concurrency & Race Condition Protection**: Database-level atomic seat locking to prevent double-booking under simultaneous multi-user loads.

---

## 🏛️ System Architecture

CineBook implements a **Layered Domain-Driven Architecture** isolating HTTP transport, application services, domain contracts, and persistence layers:

```
                  ┌───────────────────────────────┐
                  │   Client Application (React)  │
                  └───────────────┬───────────────┘
                                  │ HTTP / JSON
                                  ▼
                  ┌───────────────────────────────┐
                  │    Express Routes & Filters   │
                  └───────────────┬───────────────┘
                                  │
                                  ▼
                  ┌───────────────────────────────┐
                  │          Controllers          │
                  │  (HTTP Parsing & Serialization)│
                  └───────────────┬───────────────┘
                                  │
                                  ▼
                  ┌───────────────────────────────┐
                  │        Domain Services        │
                  │ (Business Rules & Orchestration)│
                  └──────┬─────────────────┬──────┘
                         │                 │
                         ▼                 ▼
          ┌─────────────────────┐   ┌──────────────────────┐
          │     Repositories    │   │  Strategy / Context  │
          │ (Database Isolation)│   │  (Payment Gateways)  │
          └──────────┬──────────┘   └──────────────────────┘
                     │
                     ▼
          ┌─────────────────────┐
          │    MongoDB Atlas    │
          └─────────────────────┘
```

---

## 📂 Project Directory Structure

```text
Movie-Booking-System-MERN/
├── client/                               # React Frontend
│   ├── src/
│   │   ├── components/                   # Navbar, AdminGate, PrivateRoute, etc.
│   │   ├── pages/                        # Movies, MovieDetails, Seats, AddOns, MyBookings, Admin
│   │   ├── api.js                        # Axios instance with JWT interceptors
│   │   └── App.js                        # Client routes & code splitting
├── server/                               # Node.js Express Backend
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                     # Database Singleton connection
│   │   ├── contracts/                    # Abstract base contracts & interfaces
│   │   │   ├── IBaseRepository.js        # Repository contract
│   │   │   ├── IPaymentStrategy.js       # Payment Strategy contract
│   │   │   └── INotificationService.js   # Notification service contract
│   │   ├── strategies/                   # Strategy Pattern implementations
│   │   │   ├── PaymentContext.js         # Strategy context & dynamic registry
│   │   │   ├── UpiPaymentStrategy.js     # Concrete UPI payment strategy
│   │   │   └── CardPaymentStrategy.js    # Concrete Card payment strategy
│   │   ├── models/                       # Mongoose ODM schemas
│   │   │   ├── User.js                   # User schema
│   │   │   ├── Movie.js                  # Movie schema
│   │   │   ├── Show.js                   # Show & Seat layout schema
│   │   │   └── Booking.js                # Booking schema
│   │   ├── repositories/                 # Repository Pattern implementations
│   │   │   ├── BaseRepository.js         # Base CRUD repository (Inheritance)
│   │   │   ├── MovieRepository.js        # Movie database queries
│   │   │   ├── ShowRepository.js         # Show queries & atomic seat locking
│   │   │   └── BookingRepository.js      # Booking database operations
│   │   ├── services/                     # Domain business logic
│   │   │   ├── AuthService.js            # User auth, bcrypt hashing, JWT issuance
│   │   │   ├── MovieService.js           # Movie catalog management
│   │   │   ├── ShowService.js            # Show scheduling & 3-tier matrix generation
│   │   │   ├── BookingService.js         # Booking business rules & concurrency
│   │   │   └── NotificationService.js    # Confirmation dispatching
│   │   ├── controllers/                  # Clean controllers (delegates to services)
│   │   │   ├── AuthController.js
│   │   │   ├── MovieController.js
│   │   │   ├── ShowController.js
│   │   │   └── BookingController.js
│   │   ├── middleware/                   # JWT & Admin authorization
│   │   │   ├── authMiddleware.js
│   │   │   └── adminMiddleware.js
│   │   ├── utils/                        # Shared utilities
│   │   │   ├── AppError.js               # Centralized operational error
│   │   │   └── ApiResponse.js            # Standardized API response builder
│   │   ├── routes/                       # Express route factories
│   │   ├── app.js                        # App factory & DI composition root
│   │   └── server.js                     # HTTP server entrypoint
│   └── tests/                            # Automated architectural & concurrency tests
│       ├── architecture.test.js          # OOP & SOLID test suite
│       └── concurrency.test.js           # Double-booking stress test
└── README.md
```

---

## 🧩 1. Object-Oriented Programming (OOP) Implementation

### Pillar 1: Encapsulation
* **Definition**: Bundling data with the methods that operate on that data and restricting direct access to object internals.
* **In Code (`BookingService.js`)**:
  * Instead of calculating totals on the frontend (vulnerable to user tampering), `BookingService.calculateSeatTotal` dynamically resolves prices from verified database seats.
  * Internal properties on `PaymentContext` (`this._strategy`, `this._registry`) are accessed and altered only through controlled methods (`setStrategy`, `registerStrategy`, `executePayment`).

```javascript
// server/src/services/BookingService.js
calculateSeatTotal(show, selectedSeats) {
  const seatMap = new Map();
  show.seats.forEach((s) => seatMap.set(s.seatNumber, s.price));

  let total = 0;
  selectedSeats.forEach((seatNum) => {
    const price = seatMap.get(seatNum);
    if (price !== undefined) total += price;
  });
  return total;
}
```

### Pillar 2: Abstraction
* **Definition**: Exposing high-level contracts while hiding low-level implementation details.
* **In Code (`contracts/IPaymentStrategy.js`)**:
  * `IPaymentStrategy` declares an abstract interface (`processPayment(amount, paymentDetails)`).
  * `BookingService` executes payments without knowing anything about UPI protocols, payment gateways, or card networks.

```javascript
// server/src/contracts/IPaymentStrategy.js
class IPaymentStrategy {
  async processPayment(amount, paymentDetails = {}) {
    throw new Error("Method 'processPayment(amount, paymentDetails)' must be implemented.");
  }
  getStrategyName() {
    throw new Error("Method 'getStrategyName()' must be implemented.");
  }
}
```

### Pillar 3: Inheritance
* **Definition**: Deriving new classes from existing base classes to share common behavior and eliminate code duplication.
* **In Code (`repositories/BaseRepository.js`)**:
  * Generic CRUD operations (`findById`, `findAll`, `create`, `deleteById`) live in `BaseRepository`.
  * Specialized repositories (`MovieRepository`, `ShowRepository`, `BookingRepository`) inherit and extend `BaseRepository`.

```javascript
// server/src/repositories/ShowRepository.js
class ShowRepository extends BaseRepository {
  constructor() {
    super(Show); // Calls BaseRepository constructor with Show Mongoose model
  }
  // Inherits findById, create, updateById, deleteById automatically!
}
```

### Pillar 4: Polymorphism
* **Definition**: Ability of different objects to respond to the same method invocation in their own unique way.
* **In Code (`strategies/`)**:
  * Both `UpiPaymentStrategy` and `CardPaymentStrategy` implement `processPayment(amount, details)`.
  * The caller executes `.executePayment()` on `PaymentContext`; the exact payment processing behavior changes dynamically based on the active strategy instance.

---

## 📐 2. SOLID Principles Implementation

### S — Single Responsibility Principle (SRP)
* **Definition**: A class should have only one reason to change.
* **Implementation**:
  * `BookingController`: Responsible only for parsing HTTP requests and returning HTTP responses.
  * `BookingService`: Responsible only for booking business rules and orchestration.
  * `ShowRepository`: Responsible only for database queries and atomic updates.
  * `NotificationService`: Responsible only for customer notifications.

### O — Open/Closed Principle (OCP)
* **Definition**: Software entities should be open for extension, but closed for modification.
* **Implementation**:
  * If a new payment method (e.g. `CryptoPaymentStrategy` or `StripePaymentStrategy`) is added, we **do not touch** `BookingService` or `BookingController`.
  * We simply create a class inheriting from `IPaymentStrategy` and register it with `PaymentContext.registerStrategy("CRYPTO", new CryptoPaymentStrategy())`.

### L — Liskov Substitution Principle (LSP)
* **Definition**: Subclasses must be substitutable for their base types without altering system correctness.
* **Implementation**:
  * `UpiPaymentStrategy` and `CardPaymentStrategy` return identical structured result contracts `{ success, transactionId, method, amount, message }`.
  * Any payment strategy can be swapped into `PaymentContext` without breaking the `BookingService` caller.

### I — Interface Segregation Principle (ISP)
* **Definition**: Clients should not be forced to depend on interfaces they do not use.
* **Implementation**:
  * Rather than creating one monolithic `IAppService` or exposing the entire Mongoose model API, focused contracts (`IPaymentStrategy`, `INotificationService`, `IBaseRepository`) expose only methods required for their specific domain operations.

### D — Dependency Inversion Principle (DIP)
* **Definition**: High-level modules should not depend on low-level modules; both should depend on abstractions.
* **Implementation**:
  * `BookingService` does not instantiate `Show`, `Booking`, or `UpiPaymentStrategy` directly.
  * All dependencies (`bookingRepository`, `showRepository`, `paymentContext`, `notificationService`) are passed into `BookingService` via constructor injection in the composition root (`app.js`).

---

## 🛡️ 3. Concurrency Protection & Double-Booking Prevention

### The Concurrency Problem
In high-demand ticket sales, if two users simultaneously attempt to book the exact same seat (e.g., Balcony `A1`):
* A traditional read-then-write approach (`Show.findById()` followed by `show.save()`) creates a **race condition**: both requests read `isBooked: false`, both proceed to checkout, and the second write overwrites the first, leading to a double-booking anomaly.

### The Atomic Solution
`ShowRepository.reserveSeatsAtomically` uses MongoDB's atomic document-level locking via `findOneAndUpdate` with `$elemMatch`:

```javascript
// server/src/repositories/ShowRepository.js
async reserveSeatsAtomically(showId, seatNumbers) {
  const matchCondition = {
    _id: showId,
    $and: seatNumbers.map((seatNum) => ({
      seats: {
        $elemMatch: {
          seatNumber: seatNum,
          isBooked: false, // Condition: ALL requested seats MUST be currently unbooked
        },
      },
    })),
  };

  const updateOperation = {
    $set: { "seats.$[elem].isBooked": true },
  };

  const options = {
    arrayFilters: [{ "elem.seatNumber": { $in: seatNumbers } }],
    new: true,
  };

  return await this.model.findOneAndUpdate(matchCondition, updateOperation, options);
}
```

* **Outcome**: Under simultaneous requests, the first transaction atomically claims the seat and locks it. The second concurrent query fails the `$elemMatch` match condition, returns `null`, and triggers an immediate `409 Conflict: Seat collision detected` error.
* Fully verified by our automated test suite in `server/tests/concurrency.test.js`.

---

## 🚀 How to Run the Project

### 1. Prerequisites
* Node.js (v18+)
* MongoDB (Local instance or free MongoDB Atlas cluster)

### 2. Backend Setup
```bash
cd server
npm install

# Configure environment variables (.env)
# Create server/.env with:
# PORT=5000
# MONGO_URI=mongodb://localhost:27017/movie_booking_db
# JWT_SECRET=your_jwt_secret_key

# Run tests to verify OOP, SOLID, and Concurrency
npm test

# Start server
npm start
```

### 3. Frontend Setup
```bash
cd client
npm install --legacy-peer-deps

# Start frontend
npm start
```
The React frontend runs at `http://localhost:3000` and proxies API requests to `http://localhost:5000`.

---

## 🧪 Automated Test Suite

Run the full architectural validation suite:
```bash
node --test server/tests/*.test.js
```

### Output Summary:
```text
▶ Movie Booking System - OOP & SOLID Architectural Tests
  ▶ 1. OOP Pillar: Inheritance & Abstraction
    ✔ Concrete Payment Strategies correctly inherit from IPaymentStrategy
    ✔ Calling base IPaymentStrategy throws error (Abstract Contract enforcement)
  ▶ 2. OOP Pillar: Polymorphism & Open/Closed Principle (OCP)
    ✔ PaymentContext executes UPI and Card strategies polymorphically
    ✔ OCP: A new custom payment strategy can be registered dynamically
  ▶ 3. SOLID: Single Responsibility, DI & End-to-End API Integration
    ✔ Auth: Registers user and issues JWT
    ✔ Movie CRUD: Creates and retrieves a movie
    ✔ Show Service: Creates a show with generated 3-tier seating matrix
    ✔ Booking Service: Successfully reserves seats and executes payment
    ✔ 4. System Design: Concurrency Protection against Double-Booking
    ✔ User Booking History: Retrieves user bookings
▶ System Design: Concurrency & Double-Booking Stress Test
  ✔ When 2 users simultaneously attempt to book the exact same seat ('A5'), exactly one succeeds and one receives a 409 collision error
ℹ tests 11
ℹ suites 5
ℹ pass 11
ℹ fail 0
```

---

## 🎓 Professor / Viva Defense Q&A

### Q1: Why did you separate Controllers, Services, and Repositories?
**Answer**: To enforce the **Separation of Concerns (SoC)** and the **Single Responsibility Principle (SRP)**:
* **Controllers** handle HTTP-specific logic (reading query params, cookies, request headers, status codes).
* **Services** contain core business domain logic (price calculations, seat conflict checks, payment orchestration) independent of whether the transport is REST, GraphQL, or gRPC.
* **Repositories** encapsulate database operations, decoupling the business domain from Mongoose ORM methods and database drivers.

### Q2: How does your system prevent two users from booking the same seat simultaneously?
**Answer**: We do not rely on client-side state or procedural read-then-write checks. Instead, we perform **Atomic Database Updates** using MongoDB's `findOneAndUpdate` combined with `$elemMatch` and `arrayFilters`. The query matches the show record only if *all* specified seats have `isBooked: false`. Because MongoDB guarantees single-document atomic operations, only one concurrent request can successfully mutate the document; all other simultaneous requests fail the query predicate and are rejected with HTTP 409 Conflict.

### Q3: How is the Strategy Pattern implemented in your project?
**Answer**: For payment processing:
* `IPaymentStrategy` acts as an abstract contract with `processPayment(amount, details)`.
* `UpiPaymentStrategy` and `CardPaymentStrategy` provide concrete algorithms.
* `PaymentContext` maintains a reference to the chosen strategy and executes it polymorphically at runtime.
* This fulfills the **Open/Closed Principle (OCP)**: new payment providers can be introduced without altering existing booking business logic.

### Q4: How is Dependency Injection (DI) implemented in JavaScript?
**Answer**: JavaScript does not require complex reflection frameworks (like Spring or Guice). We implement pure constructor injection in `server/src/app.js` (the Composition Root). Repositories are instantiated first, injected into domain services, and domain services are injected into controllers. This satisfies the **Dependency Inversion Principle (DIP)**.
