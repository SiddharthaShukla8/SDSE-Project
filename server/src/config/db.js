const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

/**
 * Database Singleton Configuration.
 * Demonstrates the Singleton Pattern for database connectivity.
 */
class Database {
  constructor() {
    this._connection = null;
    this._memoryServer = null;
  }

  async connect(uri = process.env.MONGO_URI) {
    if (this._connection) {
      return this._connection;
    }

    let mongoUri = uri && uri.trim() !== "" ? uri : null;

    if (!mongoUri) {
      try {
        console.log("[Database] No MONGO_URI specified. Spawning in-memory MongoDB instance...");
        this._memoryServer = await MongoMemoryServer.create();
        mongoUri = this._memoryServer.getUri();
        console.log(`[Database] In-memory MongoDB running at: ${mongoUri}`);
      } catch (err) {
        console.warn("[Database] Could not spawn MongoMemoryServer, falling back to 127.0.0.1:27017:", err.message);
        mongoUri = "mongodb://127.0.0.1:27017/movie_booking_db";
      }
    }

    try {
      this._connection = await mongoose.connect(mongoUri);
      console.log(`[Database] MongoDB Connected: ${this._connection.connection.host}`);
      return this._connection;
    } catch (error) {
      console.error("[Database] Connection Error:", error.message);
      if (process.env.NODE_ENV === "production") {
        process.exit(1);
      }
    }
  }

  async disconnect() {
    if (this._connection) {
      await mongoose.disconnect();
      this._connection = null;
      console.log("[Database] MongoDB Disconnected.");
    }
    if (this._memoryServer) {
      await this._memoryServer.stop();
      this._memoryServer = null;
    }
  }
}

// Export a single instance (Singleton)
module.exports = new Database();
