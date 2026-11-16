# 🎬 CineBook: Clean Architecture Movie Ticket Booking System

[![CI Tests](https://img.shields.io/badge/Tests-11%20Passed-brightgreen.svg)]()
[![Architecture](https://img.shields.io/badge/Architecture-Layered%20%7C%20Clean%20%7C%20SOLID-blue.svg)]()
[![Stack](https://img.shields.io/badge/Stack-MERN%20(React%2C%20Node%2C%20Express%2C%20MongoDB)-orange.svg)]()
[![License](https://img.shields.io/badge/License-MIT-purple.svg)]()

> **College Capstone System Design & Object-Oriented Software Engineering Evaluation**  
> An enterprise-grade, clean-architecture movie ticket booking application developed with the MERN stack. Built strictly according to **Object-Oriented Programming (OOP) Pillars**, **SOLID Design Principles**, and **Key System Design Patterns**, featuring **database-level concurrency locking** to eliminate double-booking race conditions.

---

## 📑 Table of Contents

- [📌 Executive Summary](#-executive-summary)
- [🛠️ Technology Stack](#️-technology-stack)
- [✨ Core Features](#-core-features)
- [🏛️ Architectural Design & System Topology](#️-architectural-design--system-topology)
- [📂 Clean Layered Project Directory](#-clean-layered-project-directory)
- [🧩 Object-Oriented Programming (OOP) Pillars in Code](#-object-oriented-programming-oop-pillars-in-code)
  - [1. Encapsulation](#1-encapsulation)
  - [2. Abstraction](#2-abstraction)
  - [3. Inheritance](#3-inheritance)
  - [4. Polymorphism](#4-polymorphism)
- [📐 SOLID Principles Demonstrated in Code](#-solid-principles-demonstrated-in-code)
  - [S — Single Responsibility Principle (SRP)](#s--single-responsibility-principle-srp)
  - [O — Open/Closed Principle (OCP)](#o--openclosed-principle-ocp)
  - [L — Liskov Substitution Principle (LSP)](#l--liskov-substitution-principle-lsp)
  - [I — Interface Segregation Principle (ISP)](#i--interface-segregation-principle-isp)
  - [D — Dependency Inversion Principle (DIP)](#d--dependency-inversion-principle-dip)
- [🛡️ Concurrency & Double-Booking Prevention](#️-concurrency--double-booking-prevention)
- [🗄️ Database Schemas & Entity Relationships](#️-database-schemas--entity-relationships)
- [🚀 Quick Start Guide (Local Setup)](#-quick-start-guide-local-setup)
- [🧪 Automated Test Suite & Concurrency Verification](#-automated-test-suite--concurrency-verification)
- [🎓 Professor & Capstone Viva Defense Guide](#-professor--capstone-viva-defense-guide)

---

## 📌 Executive Summary

Modern booking architectures face two critical engineering challenges:
1. **Maintainability & Decoupling**: Procedural controllers frequently bloat into "God objects" that mix HTTP transport, business invariants, price calculations, and low-level queries.
2. **Concurrency & Race Conditions**: High-traffic movie releases (e.g. *Salaar 2*, *Inception*, *The Dark Knight*) cause multiple users to attempt booking identical seats at the exact same millisecond.

**CineBook** solves these problems by refactoring procedural spaghetti code into a **Clean, Layered Domain-Driven Architecture**. Every component is decoupled across distinct responsibilities: **Controllers**, **Services**, **Repositories**, **Strategies**, and **Domain Contracts**. Seat reservations are protected at the database driver level using MongoDB atomic operations, guaranteeing zero double-booking even under aggressive concurrent requests.

---

## 🛠️ Technology Stack

| Layer | Technologies & Libraries | Responsibility |
| :--- | :--- | :--- |
| **Frontend UI** | **React.js (v19)**, **Tailwind CSS**, **Framer Motion**, **HTML5-QRCode** | Responsive single-page application, real-time interactive 3-tier seating grid, animated hero carousel, and JWT authentication management. |
| **Backend API** | **Node.js (v22)**, **Express.js (v4)** | RESTful API transport, routing factories, centralized error handling, and Dependency Injection composition root. |
| **Database & ODM** | **MongoDB (v8)**, **Mongoose (v8)**, **MongoMemoryServer** | Document store with compound indexing, atomic `$elemMatch` array updates, and embedded zero-config fallback. |
| **Security & Auth** | **JSON Web Tokens (JWT)**, **bcrypt.js** | Stateless bearer token authentication, cryptographic password hashing, role-based access control (Admin / User). |
| **Testing Engine** | **Node Test Runner (`node:test`)**, **Supertest** | Automated unit, polymorphic strategy, API integration, and concurrent race-condition test suites. |

---

## ✨ Core Features

### 👤 Customer Experience
- **User Authentication**: Secure sign-up and login with bcrypt salted password hashing and JWT token issuance.
- **Dynamic Blockbuster Catalog**: Interactive movie browsing showcasing real-time titles, genres, ratings, and running times with an animated hero carousel.
- **Showtime & Theater Scheduling**: Filter shows by movie, date, and theater hall (e.g., *PVR IMAX Laser*, *INOX Dolby Atmos*).
- **Interactive 3-Tier Seating Grid**: Visual layout organized into **Balcony**, **First Class**, and **Second Class** tiers with live availability status.
- **Polymorphic Checkout**: Seamless simulated checkout powered by the Strategy Pattern supporting both **Instant UPI** (VPA address) and **Credit / Debit Cards**.
- **Booking History & Digital Ticket Passes**: View verified booking history with unique ticket passes, seat numbers, timestamps, and validity status.

### 🛡️ Administrative Portal
- **Movie Catalog Management**: Admin endpoints to add, inspect, update, and delete movies with poster URLs and trailer links.
- **Show & Hall Scheduling**: Create theater halls with automated 3-tier seating matrix generation and custom tier pricing.
- **Ticket Verification (QR/ID Scan)**: Endpoint to verify and mark tickets as used upon entrance.

---

## 🏛️ Architectural Design & System Topology

CineBook strictly separates HTTP transport concerns from core business domain rules and persistence:

```
                            ┌────────────────────────────────────────┐
                            │        Client Layer (React.js)         │
                            │  Interactive UI, Seat Maps, Checkout   │
                            └───────────────────┬────────────────────┘
                                                │ JSON over HTTP (REST)
                                                ▼
                            ┌────────────────────────────────────────┐
                            │       Express Route Factories          │
                            │   Authentication & Role Middlewares    │
                            └───────────────────┬────────────────────┘
                                                │
                                                ▼
                            ┌────────────────────────────────────────┐
                            │           Controllers Layer            │
                            │   (HTTP Request Parsing & Response)    │
                            └───────────────────┬────────────────────┘
                                                │ Injected Dependency
                                                ▼
                            ┌────────────────────────────────────────┐
                            │         Domain Services Layer          │
                            │ (Business Rules, Invariants & Pricing) │
                            └─────────┬────────────────────┬─────────┘
                                      │                    │
                  Injected Dependency │                    │ Injected Strategy
                                      ▼                    ▼
          ┌───────────────────────────────────┐    ┌──────────────────────────────────┐
          │         Repository Layer          │    │      Payment Context Layer       │
          │  (Atomic Queries & Data Access)   │    │ (Polymorphic Payment Strategies) │
          └─────────────────┬─────────────────┘    └──────────────────────────────────┘
                            │
                            ▼
          ┌───────────────────────────────────┐
          │     Database Layer (MongoDB)      │
          │    Documents, Indexes, Filters    │
          └───────────────────────────────────┘
```

---

## 📂 Clean Layered Project Directory

```text
Movie-Booking-System-MERN/
├── client/                               # Frontend React Application
│   ├── src/
│   │   ├── api.js                        # Axios instance configured with JWT interceptors
│   │   ├── App.js                        # Client routes & code splitting
│   │   ├── components/                   # Navbar, AdminGate, PrivateRoute, TrailerModal
│   │   └── pages/                        # Home, Movies, MovieDetails, Seats, AddOns, MyBookings, Admin
│   ├── package.json                      # Frontend dependencies
│   └── tailwind.config.js                # Tailwind styling configuration
├── server/                               # Backend Node.js / Express Application
│   ├── src/
│   │   ├── app.js                        # Composition Root & Dependency Injection setup
│   │   ├── config/
│   │   │   └── db.js                     # Database Singleton connection manager
│   │   ├── contracts/                    # Pure Abstraction Contracts / Interfaces
│   │   │   ├── IBaseRepository.js        # Generic persistence contract
│   │   │   ├── IPaymentStrategy.js       # Payment processing strategy contract
│   │   │   └── INotificationService.js   # Notification contract
│   │   ├── strategies/                   # Strategy Pattern (Polymorphism & OCP)
│   │   │   ├── PaymentContext.js         # Strategy selector & registry
│   │   │   ├── UpiPaymentStrategy.js     # Concrete UPI payment implementation
│   │   │   └── CardPaymentStrategy.js    # Concrete Card payment implementation
│   │   ├── models/                       # Mongoose Database Schemas
│   │   │   ├── User.js                   # User identity schema
│   │   │   ├── Movie.js                  # Movie catalog schema
│   │   │   ├── Show.js                   # Show schedule & seat matrix schema
│   │   │   └── Booking.js                # Customer ticket booking schema
│   │   ├── repositories/                 # Repository Pattern (Inheritance & SoC)
│   │   │   ├── BaseRepository.js         # Base CRUD operations class
│   │   │   ├── MovieRepository.js        # Movie persistence operations
│   │   │   ├── ShowRepository.js         # Show persistence & atomic seat reservation
│   │   │   └── BookingRepository.js      # Booking database queries
│   │   ├── services/                     # Domain Business Services (Encapsulation)
│   │   │   ├── AuthService.js            # Authentication, hashing & token issuance
│   │   │   ├── MovieService.js           # Movie catalog operations
│   │   │   ├── ShowService.js            # Seating matrix generator & schedules
│   │   │   ├── BookingService.js         # Booking lifecycle & price calculation
│   │   │   └── NotificationService.js    # Confirmation dispatching
│   │   ├── controllers/                  # Thin HTTP Controllers (SRP)
│   │   │   ├── AuthController.js
│   │   │   ├── MovieController.js
│   │   │   ├── ShowController.js
│   │   │   └── BookingController.js
│   │   ├── middleware/                   # JWT & Admin authorization filters
│   │   ├── routes/                       # Route factories injected with controllers
│   │   ├── utils/                        # AppError & ApiResponse builders
│   │   └── seed.js                       # Blockbuster catalog seeder
│   ├── tests/                            # Automated Testing Suite
│   │   ├── architecture.test.js          # OOP & SOLID validation tests
│   │   └── concurrency.test.js           # Multi-user double-booking stress tests
│   ├── package.json                      # Backend dependencies & test scripts
│   └── server.js                         # Application entrypoint
└── README.md                             # Comprehensive technical documentation
```

---

## 🧩 Object-Oriented Programming (OOP) Pillars in Code

### 1. Encapsulation
* **Concept**: Data and the methods operating on that data are bundled inside a class, while restricting uncontrolled external modification.
* **Demonstration in `server/src/services/BookingService.js`**:
  * Instead of accepting client-computed amounts (which malicious actors could spoof in request bodies), the calculation of ticket prices is strictly encapsulated inside `BookingService.calculateSeatTotal()`, looking up official prices from verified seat records in the database.
  * Internal strategy fields in `PaymentContext` are private to the instance and can only be altered through controlled methods (`setStrategy`, `registerStrategy`).

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

### 2. Abstraction
* **Concept**: Hiding low-level implementation details and exposing only clean, high-level contracts to consumers.
* **Demonstration in `server/src/contracts/IPaymentStrategy.js`**:
  * `IPaymentStrategy` specifies the abstract contract for processing payments without exposing protocol specifics (e.g. UPI APIs or card merchant gateways).
  * High-level services call `processPayment(amount, details)` without knowing or caring how the underlying strategy operates.

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
module.exports = IPaymentStrategy;
```

### 3. Inheritance
* **Concept**: Creating specialized classes that inherit common properties and methods from a shared base class, reducing code redundancy.
* **Demonstration in `server/src/repositories/BaseRepository.js`**:
  * Generic CRUD operations (`findById`, `findAll`, `create`, `updateById`, `deleteById`) live in `BaseRepository`.
  * Specialized repositories (`MovieRepository`, `ShowRepository`, `BookingRepository`) inherit from `BaseRepository` via `extends` and add domain-specific queries.

```javascript
// server/src/repositories/ShowRepository.js
class ShowRepository extends BaseRepository {
  constructor() {
    super(Show); // Inherits findById, create, updateById, etc.
  }

  // Specialized domain operation
  async reserveSeatsAtomically(showId, seatNumbers) { ... }
}
```

### 4. Polymorphism
* **Concept**: Objects of different classes responding to the same method invocation in their own unique way through a common contract.
* **Demonstration in `server/src/strategies/`**:
  * Both `UpiPaymentStrategy` and `CardPaymentStrategy` implement `processPayment(amount, details)` differently.
  * The `PaymentContext` executes `this._strategy.processPayment()` interchangeably at runtime without branching `if-else` blocks in the core booking flow.

```javascript
// Polymorphic execution inside PaymentContext
async executePayment(amount, details = {}) {
  return await this._strategy.processPayment(amount, details);
}
```

---

## 📐 SOLID Principles Demonstrated in Code

### S — Single Responsibility Principle (SRP)
* **Rule**: A class should have one, and only one, reason to change.
* **Implementation**:
  * `BookingController`: Parses HTTP headers, query params, and body, and returns JSON status codes. Zero business logic.
  * `BookingService`: Manages business rules, seat total calculation, and booking workflows.
  * `ShowRepository`: Directly interacts with the database for atomic updates and seat queries.
  * `NotificationService`: Handles customer confirmation dispatching.

### O — Open/Closed Principle (OCP)
* **Rule**: Software entities should be open for extension, but closed for modification.
* **Implementation**:
  * To support a new payment method (e.g. `CryptoPaymentStrategy` or `StripePaymentStrategy`), developers do not modify `BookingService` or `BookingController`.
  * Create a new class extending `IPaymentStrategy` and register it via `PaymentContext.registerStrategy("CRYPTO", new CryptoPaymentStrategy())`. Verified in automated tests.

### L — Liskov Substitution Principle (LSP)
* **Rule**: Objects of a superclass should be replaceable with objects of its subclasses without breaking system behavior.
* **Implementation**:
  * Both `UpiPaymentStrategy` and `CardPaymentStrategy` return an identical result signature:
    `{ success: boolean, transactionId: string, method: string, amount: number, message: string }`.
  * Any strategy can replace another inside `BookingService` without altering system stability.

### I — Interface Segregation Principle (ISP)
* **Rule**: Clients should not be forced to depend on interfaces they do not use.
* **Implementation**:
  * Rather than creating one massive monolithic interface for all external actions, small, focused contracts (`IPaymentStrategy`, `INotificationService`, `IBaseRepository`) expose only methods pertinent to their specific domain.

### D — Dependency Inversion Principle (DIP)
* **Rule**: High-level modules should not depend on low-level modules; both should depend on abstractions.
* **Implementation**:
  * `BookingService` does not instantiate Mongoose models directly.
  * All dependencies (`bookingRepository`, `showRepository`, `paymentContext`, `notificationService`) are passed via constructor dependency injection in `server/src/app.js` (the Composition Root).

---

## 🛡️ Concurrency & Double-Booking Prevention

### The Race Condition Problem
In cinema ticketing, if User A and User B select the identical seat (e.g. `Balcony A1`) simultaneously:
```
Time  User A Request                    User B Request
────────────────────────────────────────────────────────────────
t1    Read Show (Seat A1 unbooked)
t2                                      Read Show (Seat A1 unbooked)
t3    Save Booking (A1 = booked)
t4                                      Save Booking (Overwrites A1!) 💥 DOUBLE BOOKING!
```
A standard read-then-write approach (`Show.findById()` followed by `show.save()`) results in a critical race condition.

### The Atomic Solution
`ShowRepository.reserveSeatsAtomically` uses MongoDB's atomic document-level locking via `findOneAndUpdate` with `$elemMatch` and `arrayFilters`:

```javascript
// server/src/repositories/ShowRepository.js
async reserveSeatsAtomically(showId, seatNumbers) {
  const matchCondition = {
    _id: showId,
    $and: seatNumbers.map((seatNum) => ({
      seats: {
        $elemMatch: {
          seatNumber: seatNum,
          isBooked: false, // Condition: EVERY requested seat MUST be currently unbooked
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

* **Outcome**: When two requests arrive at the exact same millisecond, MongoDB's single-document atomic write lock ensures only the first query succeeds in updating the document.
* The second concurrent query fails the `$elemMatch` condition (`isBooked: false` is no longer true), returns `null`, and triggers an immediate **HTTP `409 Conflict: Seat collision detected`** error.
* Fully proven by our automated concurrency stress test in `server/tests/concurrency.test.js`.

---

## 🗄️ Database Schemas & Entity Relationships

```
┌─────────────────────┐              ┌──────────────────────────┐
│        User         │              │          Movie           │
├─────────────────────┤              ├──────────────────────────┤
│ _id: ObjectId       │              │ _id: ObjectId            │
│ name: String        │              │ title: String            │
│ email: String (idx) │              │ description: String      │
│ password: Hash      │              │ genre: String            │
│ role: Enum          │              │ duration: Number         │
│ watchlist: [MovieId]│              │ poster: String (URL)     │
└──────────┬──────────┘              │ trailerUrl: String       │
           │                         └────────────┬─────────────┘
           │ 1:N                                  │ 1:N
           ▼                                      ▼
┌─────────────────────┐              ┌──────────────────────────┐
│       Booking       │  N:1         │           Show           │
├─────────────────────┤──────────────▶──────────────────────────┤
│ _id: ObjectId       │              │ _id: ObjectId            │
│ userId: Ref(User)   │              │ movieId: Ref(Movie)      │
│ showId: Ref(Show)   │              │ theatre: String          │
│ seats: [String]     │              │ date: String             │
│ totalPrice: Number  │              │ time: String             │
│ paymentStatus: Enum │              │ balconyPrice: Number     │
│ used: Boolean       │              │ firstClassPrice: Number  │
│ status: Enum        │              │ secondClassPrice: Number │
└─────────────────────┘              │ seats: [SeatSubdocument] │
                                     └──────────────────────────┘
```

---

## 🚀 Quick Start Guide (Local Setup)

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: Optional (An embedded zero-configuration in-memory database starts automatically if no local MongoDB instance or Atlas connection string is provided).

### 2. Clone Repository
```bash
git clone https://github.com/SiddharthaShukla8/SDSE-Project.git
cd SDSE-Project
```

### 3. Backend Setup
```bash
cd server
npm install

# Run automated tests to verify OOP, SOLID, and concurrency
npm test

# Start backend server
npm start
```
*Backend runs on `http://localhost:5001` (with automatic seed data for movies and shows).*

### 4. Frontend Setup
In a separate terminal:
```bash
cd client
npm install --legacy-peer-deps

# Start React development server
npm start
```
*Frontend runs on `http://localhost:3000` and automatically connects to the backend API.*

---

## 🧪 Automated Test Suite & Concurrency Verification

Run all test suites using Node's native test runner:
```bash
cd server
npm test
```

### Complete Test Results:
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
ℹ tests 11, suites 5, pass 11, fail 0
```

---

## 🎓 Professor & Capstone Viva Defense Guide

### Q1: Why did you separate Controllers, Services, and Repositories?
> **Answer**: To strictly enforce **Separation of Concerns (SoC)** and the **Single Responsibility Principle (SRP)**.  
> - **Controllers** handle HTTP-specific logic (query parameters, JSON parsing, HTTP status codes).  
> - **Services** encapsulate the core business domain logic (price validation, seat availability checks, payment orchestration) independent of transport protocol.  
> - **Repositories** encapsulate data access logic, isolating Mongoose and database driver calls from business workflows.

### Q2: How does your system prevent two users from booking the same seat simultaneously?
> **Answer**: Rather than relying on fragile read-then-write logic, we use **Atomic Database Updates** via MongoDB's `findOneAndUpdate` combined with `$elemMatch` and `arrayFilters`. The query matches the target show document only if *every* requested seat has `isBooked: false`. Because MongoDB guarantees single-document atomic operations, only one concurrent request succeeds in updating the document; any simultaneous request fails the query predicate, returns `null`, and triggers an immediate HTTP `409 Conflict: Seat collision detected` error.

### Q3: How is the Strategy Pattern implemented in this project?
> **Answer**: To demonstrate the **Open/Closed Principle (OCP)** and **Polymorphism**:
> - `IPaymentStrategy` acts as an abstract contract defining `processPayment(amount, details)`.
> - `UpiPaymentStrategy` and `CardPaymentStrategy` provide concrete algorithms.
> - `PaymentContext` dynamically registers and delegates payment execution to the selected strategy.  
> New payment methods (e.g. Stripe, NetBanking) can be added without modifying the core `BookingService`.

### Q4: How is Dependency Injection (DI) implemented without external frameworks?
> **Answer**: We utilize pure **Constructor Injection** wired inside `server/src/app.js` (the Composition Root). Repositories are instantiated first, injected into domain services, and domain services are injected into controllers. This satisfies the **Dependency Inversion Principle (DIP)**: high-level services depend on abstract contracts and injected dependencies rather than hardcoding concrete implementations.

---

## 👨‍💻 Project Maintainer
- **Siddhartha Shukla** — Capstone System Design & Object-Oriented Software Engineering Evaluation  
- **Repository**: [https://github.com/SiddharthaShukla8/SDSE-Project.git](https://github.com/SiddharthaShukla8/SDSE-Project.git)
