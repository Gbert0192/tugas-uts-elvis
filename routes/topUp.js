const express = require("express");
const { isAuthenticated } = require("../middleware/auth");
const topUpController = require("../controllers/topUpController");
const router = express.Router();

router.get("/:id/topup", isAuthenticated, topUpController.getTopUpPage);
router.post("/:id/topup", isAuthenticated, topUpController.postTopUpPage);

module.exports = router;
