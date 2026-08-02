const products = require("../api/products");
const checkoutConfig = require("../api/checkout-config");
const createCheckoutSession = require("../api/create-checkout-session");

module.exports = function setupProxy(app) {
  app.get("/api/products", products);
  app.get("/api/checkout-config", checkoutConfig);
  app.post("/api/create-checkout-session", createCheckoutSession);
};
