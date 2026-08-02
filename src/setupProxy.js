const products = require("../api/products");

module.exports = function setupProxy(app) {
  app.get("/api/products", products);
};
