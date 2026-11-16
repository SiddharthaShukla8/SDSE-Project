const express = require("express");
const router = express.Router();

/**
 * Factory that creates Auth routes with Injected AuthController.
 * @param {import("../controllers/AuthController")} authController
 */
module.exports = function createAuthRoutes(authController) {
  router.post("/register", authController.register);
  router.post("/login", authController.login);
  return router;
};
