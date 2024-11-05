// routes/user.js
const express = require("express");
const { body } = require("express-validator");
const { isAuthenticated } = require("../middleware/auth");
const userController = require("../controllers/userController");
const upload = require("../controllers/photoController");

const router = express.Router();

// Mengambil data pengguna berdasarkan ID
router.get("/:id", isAuthenticated, userController.getUserData);

// Menampilkan halaman profil pengguna
router.get("/:id/profile", isAuthenticated, userController.getUserProfile);

// Mengupdate profil pengguna
router.post(
  "/:id/profile",
  upload.single("img"),
  isAuthenticated,
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
  userController.updateUserProfile
);

module.exports = router;
