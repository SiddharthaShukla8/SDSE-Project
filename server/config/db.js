const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        let uri = process.env.MONGO_URI;
        if (!uri || uri.trim() === "" || uri.includes("your_mongodb")) {
            console.log("No valid MONGO_URI in .env. Initializing embedded in-memory MongoDB...");
            const { MongoMemoryServer } = require("mongodb-memory-server");
            const mongod = await MongoMemoryServer.create();
            uri = mongod.getUri();
            console.log(`Embedded MongoDB started at: ${uri}`);
        }
        await mongoose.connect(uri);
        console.log("MongoDB Connected");
    } catch (error) {
        console.error("MongoDB Connection Error:", error);
        process.exit(1);
    }
};

module.exports = connectDB;
