/**
 * IBaseRepository Contract (Abstract Base Class).
 * Demonstrates Abstraction & Interface Segregation for persistence.
 */
class IBaseRepository {
  async findById(id) {
    throw new Error("Method 'findById(id)' must be implemented.");
  }

  async findAll(filter = {}) {
    throw new Error("Method 'findAll(filter)' must be implemented.");
  }

  async create(data) {
    throw new Error("Method 'create(data)' must be implemented.");
  }

  async updateById(id, data) {
    throw new Error("Method 'updateById(id, data)' must be implemented.");
  }

  async deleteById(id) {
    throw new Error("Method 'deleteById(id)' must be implemented.");
  }
}

module.exports = IBaseRepository;
