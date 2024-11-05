const express = require("express");
const { isAuthenticated } = require("../middleware/auth");
const cartController = require("../controllers/cartController");

const router = express.Router();

router.get("/:id/cart", isAuthenticated, cartController.getCartPage);
