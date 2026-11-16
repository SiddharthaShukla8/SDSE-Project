const Movie = require("./models/Movie");
const Show = require("./models/Show");
const User = require("./models/User");
const bcrypt = require("bcrypt");

async function seedData() {
  const movieCount = await Movie.countDocuments();
  if (movieCount === 0) {
    console.log("[Seed] Populating initial movies and shows...");

    const movie1 = await Movie.create({
      title: "Inception: Redux",
      description: "A thief who steals corporate secrets through dream-sharing technology.",
      genre: "Sci-Fi / Thriller",
      duration: 148,
      poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800",
      rating: 8.8,
      status: "running"
    });

    const movie2 = await Movie.create({
      title: "Interstellar Odyssey",
      description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
      genre: "Sci-Fi / Adventure",
      duration: 169,
      poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800",
      rating: 8.7,
      status: "running"
    });

    const movie3 = await Movie.create({
      title: "The Dark Knight Rises",
      description: "Eight years after the Joker's reign of anarchy, Batman must defend Gotham from the brutal terrorist Bane.",
      genre: "Action / Drama",
      duration: 165,
      poster: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800",
      rating: 9.0,
      status: "running"
    });

    // Generate seats according to schema
    const makeSeats = () => {
      const rows = ["A", "B", "C", "D", "E"];
      const seats = [];
      rows.forEach(r => {
        const category = r === "A" ? "Balcony" : r === "B" || r === "C" ? "First Class" : "Second Class";
        const price = category === "Balcony" ? 350 : category === "First Class" ? 250 : 150;
        for (let num = 1; num <= 8; num++) {
          seats.push({
            seatNumber: `${r}${num}`,
            category,
            price,
            isBooked: false
          });
        }
      });
      return seats;
    };

    await Show.create({
      movieId: movie1._id,
      theatre: "IMAX Laser Hall 1",
      date: new Date().toISOString().split("T")[0],
      time: "18:30",
      balconyPrice: 350,
      firstClassPrice: 250,
      secondClassPrice: 150,
      seats: makeSeats()
    });

    await Show.create({
      movieId: movie2._id,
      theatre: "Dolby Atmos Screen 2",
      date: new Date().toISOString().split("T")[0],
      time: "21:00",
      balconyPrice: 350,
      firstClassPrice: 250,
      secondClassPrice: 150,
      seats: makeSeats()
    });

    console.log("[Seed] Sample movies & shows created!");
  }

  // Ensure default admin user exists
  const adminExists = await User.findOne({ email: "admin@cinebook.com" });
  if (!adminExists) {
    const passwordHash = await bcrypt.hash("Admin@123", 10);
    await User.create({
      name: "System Admin",
      email: "admin@cinebook.com",
      password: passwordHash,
      role: "admin",
      phone: "+91 9876543210"
    });
    console.log("[Seed] Default admin account created: admin@cinebook.com / Admin@123");
  }
}

module.exports = seedData;
