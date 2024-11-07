// routes/product.js
const express = require("express");
const { isAuthenticated } = require("../middleware/auth");
const productController = require("../controllers/productController");
const router = express.Router();
const axios = require("axios");

// Route untuk halaman produk store
router.get(
  "/:id/store/:storeId/:storeCategory",
  isAuthenticated,
  productController.getStoreProductPage
);

module.exports = router;
