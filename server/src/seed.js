const Movie = require("./models/Movie");
const Show = require("./models/Show");
const User = require("./models/User");
const bcrypt = require("bcrypt");

async function seedData() {
  const movieCount = await Movie.countDocuments();
  if (movieCount === 0) {
    console.log("[Seed] Populating initial blockbuster movies and shows...");

    const initialMovies = [
      {
        title: "Salaar 2: Shouryaanga Parvam",
        description: "War begins in the brutal world of Khansar as Deva and Varadha's blood rivalry explodes into an all-out battle for supremacy.",
        genre: "Action",
        duration: 180,
        poster: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800",
        trailerUrl: "https://www.youtube.com/watch?v=4GPvYMKrytI",
      },
      {
        title: "Jana Nayagan",
        description: "A charismatic leader fights systemic corruption and delivers justice in an intense political-action showdown.",
        genre: "Action",
        duration: 165,
        poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800",
        trailerUrl: "https://www.youtube.com/watch?v=YoHD9XEInc0",
      },
      {
        title: "Spirit",
        description: "An uncompromising undercover cop infiltrates deep into an international crime syndicate where survival has no rules.",
        genre: "Thriller",
        duration: 170,
        poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800",
        trailerUrl: "https://www.youtube.com/watch?v=8g18jFHCLXk",
      },
      {
        title: "Varanasi",
        description: "An ancient mythical secret hidden in the spiritual heart of Kashi reawakens in the modern era.",
        genre: "Drama",
        duration: 155,
        poster: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800",
        trailerUrl: "https://www.youtube.com/watch?v=EXeTwQWrcwY",
      },
      {
        title: "Inception: Redux",
        description: "A thief who steals corporate secrets through dream-sharing technology is tasked with planting an idea into the mind of a CEO.",
        genre: "Sci-Fi",
        duration: 148,
        poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800",
        trailerUrl: "https://www.youtube.com/watch?v=YoHD9XEInc0",
      },
      {
        title: "Interstellar Odyssey",
        description: "A team of explorers travel through a newly discovered wormhole in space in an attempt to ensure humanity's survival.",
        genre: "Sci-Fi",
        duration: 169,
        poster: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800",
        trailerUrl: "https://www.youtube.com/watch?v=zSWdZVtXT7E",
      },
      {
        title: "The Dark Knight",
        description: "Batman confronts his greatest psychological and physical test when the maniacal Joker unleashes chaos upon Gotham City.",
        genre: "Action",
        duration: 152,
        poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800",
        trailerUrl: "https://www.youtube.com/watch?v=EXeTwQWrcwY",
      },
      {
        title: "Spider-Man: Beyond Boundaries",
        description: "Miles Morales catapults across the Multiverse to protect the fabric of reality alongside Spider-heroes from alternate dimensions.",
        genre: "Action",
        duration: 140,
        poster: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=800",
        trailerUrl: "https://www.youtube.com/watch?v=cqGjhVJWtEg",
      },
    ];

    const createdMovies = await Movie.insertMany(initialMovies);

    // Generate 3-tier seats (Balcony, First Class, Second Class)
    const makeSeats = () => {
      const rows = ["A", "B", "C", "D", "E"];
      const seats = [];
      rows.forEach((r) => {
        const category =
          r === "A"
            ? "Balcony"
            : r === "B" || r === "C"
            ? "First Class"
            : "Second Class";
        const price =
          category === "Balcony" ? 350 : category === "First Class" ? 250 : 150;
        for (let num = 1; num <= 10; num++) {
          seats.push({
            seatNumber: `${r}${num}`,
            category,
            price,
            isBooked: false,
          });
        }
      });
      return seats;
    };

    const today = new Date().toISOString().split("T")[0];

    // Create scheduled shows for top movies
    for (let i = 0; i < Math.min(createdMovies.length, 4); i++) {
      const m = createdMovies[i];
      await Show.create({
        movieId: m._id,
        theatre: i % 2 === 0 ? "PVR IMAX Hall 1" : "INOX Dolby Atmos Screen 2",
        date: today,
        time: i % 2 === 0 ? "18:30" : "21:00",
        balconyPrice: 350,
        firstClassPrice: 250,
        secondClassPrice: 150,
        seats: makeSeats(),
      });
    }

    console.log(`[Seed] Successfully seeded ${createdMovies.length} blockbuster movies & scheduled shows!`);
  }

  // Ensure default admin and test user exist
  const adminExists = await User.findOne({ email: "admin@cinebook.com" });
  if (!adminExists) {
    const passwordHash = await bcrypt.hash("Admin@123", 10);
    await User.create({
      name: "System Admin",
      email: "admin@cinebook.com",
      password: passwordHash,
      role: "admin",
    });
    console.log("[Seed] Default admin account created: admin@cinebook.com / Admin@123");
  }

  const userExists = await User.findOne({ email: "user@cinebook.com" });
  if (!userExists) {
    const passwordHash = await bcrypt.hash("User@123", 10);
    await User.create({
      name: "Demo Moviegoer",
      email: "user@cinebook.com",
      password: passwordHash,
      role: "user",
    });
    console.log("[Seed] Demo user account created: user@cinebook.com / User@123");
  }
}

module.exports = seedData;
