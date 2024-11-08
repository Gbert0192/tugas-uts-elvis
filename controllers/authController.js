// controllers/authController.js
const jwt = require("jsonwebtoken");
const userManager = require("../models/schemas/userManager");
const { secretKey } = require("../middleware/auth");
const { validationResult } = require("express-validator");
const { v4: uuidv4 } = require("uuid"); // Import uuid versi 4
// Render halaman login
exports.renderLoginPage = (req, res) => {
  const nomorHp = req.session.nomorHp || null;
  const message = req.session.message || null;
  const messageError = req.session.messageError || null;
  req.session.message = null;
  req.session.messageError = null;

  res.render("loginPage/login", {
    layout: "loginPage/mainLogin",
    title: "Login Page",
    message,
    nomorHp,
    messageError,
    method: "Register",
    href: "/register",
  });
};

// Proses login dan redirect
exports.loginUser = async (req, res) => {
  try {
    const result = await userManager.passwordVerfication(
      req.body.noHp,
      req.body.password
    );

    if (result === null) {
      req.session.messageError = "User dengan nomor HP tidak ditemukan";
      req.session.nomorHp = req.body.noHp;
      return res.redirect("/");
    }

    if (result === false) {
      req.session.messageError = "Password Salah, Mohon coba kembali";
      req.session.nomorHp = req.body.noHp;
      return res.redirect("/");
    }

    const accessToken = jwt.sign({ id: result.id }, secretKey, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign({ id: result.id }, secretKey, {
      expiresIn: "7d",
    });

    // Set cookie untuk refreshToken dan accessToken
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });
    res.cookie("accessToken", accessToken, { httpOnly: true });

    req.session.nomorHp = result.noHp;

    res.redirect(`/main/${result.id}`);
  } catch (error) {
    console.error("Error finding user:", error);
    req.session.message = "Terjadi kesalahan saat login.";
    return res.redirect("/");
  }
};

// Render halaman register
exports.renderRegisterPage = (req, res) => {
  const errorMessages = req.session.messages || null;
  req.session.messages = null;

  res.render("loginPage/register", {
    layout: "loginPage/mainLogin",
    title: "Register",
    method: "Sign In",
    href: "/",
    errorMessages,
  });
};

// Proses register pengguna baru
exports.registerUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    const errorMessages = [];

    if (!errors.isEmpty()) {
      errors.array().forEach((err) => errorMessages.push(err.msg));
    }

    const { noHp, email, name, password, sex } = req.body;
    const userSex = sex || "";
    const { noHpExists, emailExists } = await userManager.availableUsers(
      noHp,
      email
    );

    if (noHpExists) errorMessages.push("No HP sudah ada!");
    if (emailExists) errorMessages.push("Email sudah ada!");

    if (errorMessages.length > 0) {
      req.session.messages = errorMessages;
      return res.redirect("/register");
    }
    const userId = uuidv4();
    await userManager.addUser({
      id: userId,
      noHp,
      email,
      name,
      password,
      sex: userSex,
    });
    req.session.message = "User berhasil ditambahkan!";
    return res.redirect("/");
  } catch (error) {
    console.error("Error adding user:", error);
    req.session.messages = "Terjadi kesalahan saat mendaftar.";
    return res.redirect("/register");
  }
};

// Logout user
exports.logoutUser = (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  req.session.nomorHp = null;
  req.session.message = "Anda telah logout.";
  res.redirect("/");
};
