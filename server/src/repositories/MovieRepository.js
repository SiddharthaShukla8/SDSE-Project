const BaseRepository = require("./BaseRepository");
const Movie = require("../models/Movie");

/**
 * MovieRepository.
 * Inherits generic CRUD from BaseRepository and provides specialized movie queries.
 */
class MovieRepository extends BaseRepository {
  constructor() {
    super(Movie);
  }

  async findByGenre(genre) {
    return await this.model.find({ genre: new RegExp(genre, "i") });
  }

  async searchByTitle(query) {
    return await this.model.find({ title: { $regex: query, $options: "i" } });
  }
}

module.exports = MovieRepository;
