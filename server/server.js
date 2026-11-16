require("dotenv").config();
const db = require("./src/config/db");
const createApp = require("./src/app");
const seedData = require("./src/seed");

const PORT = process.env.PORT || 5001;

async function bootstrap() {
  // 1. Initialize MongoDB Connection
  await db.connect();

  // 2. Run initial seed data if DB is empty
  try {
    await seedData();
  } catch (err) {
    console.warn("[Seed] Warning:", err.message);
  }

  // 3. Initialize Injected App Composition Root
  const { app } = createApp();

  // 4. Start HTTP Server
  app.listen(PORT, () => {
    console.log(`🎬 CineBook Server listening on http://localhost:${PORT}`);
    console.log(`✨ Layered OOP & SOLID Architecture initialized successfully.`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start CineBook Server:", err);
});
