const IPaymentStrategy = require("../contracts/IPaymentStrategy");
const UpiPaymentStrategy = require("./UpiPaymentStrategy");
const CardPaymentStrategy = require("./CardPaymentStrategy");
const AppError = require("../utils/AppError");

/**
 * PaymentContext.
 * Implements the Strategy Pattern and Open/Closed Principle.
 * Selects and executes the configured IPaymentStrategy at runtime.
 */
class PaymentContext {
  /**
   * @param {IPaymentStrategy} [strategy] - Initial strategy instance
   */
  constructor(strategy = null) {
    this._strategy = strategy;
    this._registry = new Map();

    // Register default strategies
    this.registerStrategy("UPI", new UpiPaymentStrategy());
    this.registerStrategy("CARD", new CardPaymentStrategy());
  }

  /**
   * Register a new payment strategy without modifying existing business logic (OCP).
   * @param {string} name
   * @param {IPaymentStrategy} strategy
   */
  registerStrategy(name, strategy) {
    if (!(strategy instanceof IPaymentStrategy)) {
      throw new Error("Strategy must extend IPaymentStrategy");
    }
    this._registry.set(name.toUpperCase(), strategy);
  }

  /**
   * Sets strategy by identifier or instance.
   * @param {string|IPaymentStrategy} strategy
   */
  setStrategy(strategy) {
    if (typeof strategy === "string") {
      const found = this._registry.get(strategy.toUpperCase());
      if (!found) {
        throw new AppError(`Unsupported payment method: ${strategy}`, 400);
      }
      this._strategy = found;
    } else if (strategy instanceof IPaymentStrategy) {
      this._strategy = strategy;
    } else {
      throw new AppError("Invalid payment strategy supplied.", 400);
    }
  }

  getStrategy() {
    return this._strategy;
  }

  /**
   * Delegates execution to the current concrete strategy (Polymorphism & LSP).
   * @param {number} amount
   * @param {Object} details
   */
  async executePayment(amount, details = {}) {
    if (!this._strategy) {
      // Default to UPI if none explicitly selected
      this._strategy = this._registry.get("UPI");
    }
    return await this._strategy.processPayment(amount, details);
  }
}

module.exports = PaymentContext;
