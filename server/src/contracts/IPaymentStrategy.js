/**
 * IPaymentStrategy Contract (Abstract Base Class).
 * Demonstrates:
 * - Abstraction (Hides payment gateway details from consumers)
 * - Interface Segregation (Small, focused payment contract)
 * - Open/Closed & Polymorphism (New strategies can be added without modifying booking logic)
 */
class IPaymentStrategy {
  /**
   * Processes payment for a given amount.
   * Must be overridden by concrete strategies.
   * @param {number} amount - Total amount to charge
   * @param {Object} paymentDetails - Payment parameters (e.g. upiId, card details)
   * @returns {Promise<{ success: boolean, transactionId: string, message: string }>}
   */
  async processPayment(amount, paymentDetails = {}) {
    throw new Error("Method 'processPayment(amount, paymentDetails)' must be implemented.");
  }

  /**
   * Returns the strategy identifier name.
   * @returns {string}
   */
  getStrategyName() {
    throw new Error("Method 'getStrategyName()' must be implemented.");
  }
}

module.exports = IPaymentStrategy;
