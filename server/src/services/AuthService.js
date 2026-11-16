const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");

/**
 * AuthService.
 * Encapsulates authentication, password hashing, and token generation.
 * Demonstrates SRP (Single Responsibility Principle).
 */
class AuthService {
  constructor(userModel = User) {
    this.userModel = userModel;
  }

  generateToken(user) {
    const secret = process.env.JWT_SECRET || "secret";
    return jwt.sign(
      { id: user._id, _id: user._id, role: user.role, name: user.name },
      secret,
      { expiresIn: "7d" }
    );
  }

  async register({ name, email, password, role = "user" }) {
    if (!name || !email || !password) {
      throw new AppError("Name, email, and password are required.", 400);
    }

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new AppError("Email already registered.", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userModel.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    const token = this.generateToken(user);

    return {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async login({ email, password }) {
    if (!email || !password) {
      throw new AppError("Email and password are required.", 400);
    }

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new AppError("Invalid email or password.", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError("Invalid email or password.", 401);
    }

    const token = this.generateToken(user);

    return {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}

module.exports = AuthService;
