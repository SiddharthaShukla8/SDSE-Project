const IPaymentStrategy = require("../contracts/IPaymentStrategy");

/**
 * UpiPaymentStrategy.
 * Demonstrates:
 * - Inheritance (extends IPaymentStrategy)
 * - Polymorphism (implements processPayment with UPI logic)
 * - Liskov Substitution (can substitute any IPaymentStrategy)
 */
class UpiPaymentStrategy extends IPaymentStrategy {
  constructor() {
    super();
  }

  getStrategyName() {
    return "UPI";
  }

  async processPayment(amount, paymentDetails = {}) {
    const upiId = paymentDetails.upiId || "user@okaxis";
    
    // Simulate UPI verification
    if (amount <= 0) {
      return {
        success: false,
        transactionId: null,
        message: "Payment amount must be greater than zero.",
      };
    }

    const transactionId = `UPI-TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    return {
      success: true,
      transactionId,
      method: "UPI",
      payer: upiId,
      amount,
      message: `Payment of ₹${amount} successfully completed via UPI (${upiId}).`,
    };
  }
}

module.exports = UpiPaymentStrategy;
