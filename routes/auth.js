// routes/auth.js
const express = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/authController");

const router = express.Router();

// Halaman login
router.get("/", authController.renderLoginPage);

// Proses login dan redirect
router.post("/", authController.loginUser);

// Halaman register
router.get("/register", authController.renderRegisterPage);

// Proses register pengguna baru
router.post(
  "/register",
  [
    body("noHp").isMobilePhone("id-ID").withMessage("Nomor HP tidak valid!"),
    body("email").isEmail().withMessage("Email tidak valid!"),
    body("name")
      .notEmpty()
      .withMessage("Nama tidak boleh kosong!")
      .matches(/^[A-Za-z\s]+$/)
      .withMessage("Nama hanya boleh berisi huruf dan spasi!"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password minimal 6 karakter!"),
  ],
  authController.registerUser
);

// Logout user
router.post("/logout", authController.logoutUser);

module.exports = router;
