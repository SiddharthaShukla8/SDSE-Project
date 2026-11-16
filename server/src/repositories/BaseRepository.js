const IBaseRepository = require("../contracts/IBaseRepository");

/**
 * BaseRepository.
 * Demonstrates:
 * - Inheritance (Base class providing reusable CRUD data access)
 * - Separation of Concerns (Isolates Mongoose ORM methods from domain services)
 */
class BaseRepository extends IBaseRepository {
  /**
   * @param {import("mongoose").Model} model - Mongoose model
   */
  constructor(model) {
    super();
    this.model = model;
  }

  async findById(id) {
    return await this.model.findById(id);
  }

  async findAll(filter = {}, sort = { createdAt: -1 }) {
    return await this.model.find(filter).sort(sort);
  }

  async findOne(filter = {}) {
    return await this.model.findOne(filter);
  }

  async create(data) {
    return await this.model.create(data);
  }

  async updateById(id, data, options = { new: true }) {
    return await this.model.findByIdAndUpdate(id, data, options);
  }

  async deleteById(id) {
    return await this.model.findByIdAndDelete(id);
  }

  async count(filter = {}) {
    return await this.model.countDocuments(filter);
  }
}

module.exports = BaseRepository;
