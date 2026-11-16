const IPaymentStrategy = require("../contracts/IPaymentStrategy");

/**
 * CardPaymentStrategy.
 * Demonstrates:
 * - Inheritance (extends IPaymentStrategy)
 * - Polymorphism (implements processPayment with Card payment logic)
 * - Liskov Substitution (can substitute any IPaymentStrategy)
 */
class CardPaymentStrategy extends IPaymentStrategy {
  constructor() {
    super();
  }

  getStrategyName() {
    return "CARD";
  }

  async processPayment(amount, paymentDetails = {}) {
    const cardNumber = paymentDetails.cardNumber || "••••-••••-••••-4242";

    if (amount <= 0) {
      return {
        success: false,
        transactionId: null,
        message: "Payment amount must be greater than zero.",
      };
    }

    const transactionId = `CARD-TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    return {
      success: true,
      transactionId,
      method: "CREDIT_DEBIT_CARD",
      last4: cardNumber.slice(-4),
      amount,
      message: `Payment of ₹${amount} successfully completed using Card ending in ${cardNumber.slice(-4)}.`,
    };
  }
}

module.exports = CardPaymentStrategy;
