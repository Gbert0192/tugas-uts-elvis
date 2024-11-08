const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const { body } = require("express-validator");

const app = express();

// Middleware
app.use(express.json());
app.use(express.static("public"));
app.use(expressLayouts);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");

app.use(
  session({
    secret: "secret aja",
    resave: false,
    saveUninitialized: true,
  })
);

// Controller yang diperlukan
const authController = require("./controllers/authController");
const userController = require("./controllers/userController");
const topUpController = require("./controllers/topUpController");
const productController = require("./controllers/productController");
const cartController = require("./controllers/cartController");
const categoryController = require("./controllers/categoryController");
const historyController = require("./controllers/historyController");
const upload = require("./controllers/photoController");
const { isAuthenticated } = require("./middleware/auth");

// Halaman login
app.get("/", authController.renderLoginPage);

// Proses login dan redirect
app.post("/", authController.loginUser);

// Halaman register
app.get("/register", authController.renderRegisterPage);

// Proses register pengguna baru
app.post(
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
app.post("/logout", authController.logoutUser);

// Mengambil data pengguna berdasarkan ID
app.get("/main/:id", isAuthenticated, userController.getUserData);

//menampilkan halaman searching
app.get("/main/:id/search", isAuthenticated, userController.searchHandle);

// Menampilkan halaman profil pengguna
app.get("/main/:id/profile", isAuthenticated, userController.getUserProfile);

//menampilkan halaman berdasarkan kategory
app.get("/main/:id/profile", isAuthenticated, userController.getCategory);

// Mengupdate profil pengguna
app.post(
  "/main/:id/profile",
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

// Route untuk halaman produk store
app.get(
  "/main/:id/store/:storeId/:storeCategory",
  isAuthenticated,
  productController.getStoreProductPage
);

// Route untuk halaman checkout
app.get("/checkout/:id", isAuthenticated, cartController.getCheckOutPage);
app.post("/checkout/:id", isAuthenticated, cartController.handleCheckout);
app.post(
  "/checkout/:id/confirm",
  isAuthenticated,
  cartController.confirmCheckout
);

// Route top-up
app.get("/main/:id/topup", isAuthenticated, topUpController.getTopUpPage);
app.post("/main/:id/topup", isAuthenticated, topUpController.postTopUpPage);

// halaman category
app.get(
  "/main/:id/:category",
  isAuthenticated,
  categoryController.getCategoryPage
);

//halaman history
app.get(
  "/productHistory/:id",
  isAuthenticated,
  historyController.getProductHistoryPage
);
app.get(
  "/topUpHistory/:id",
  isAuthenticated,
  historyController.getTopUpHistoryPage
);
app.use((req, res) => {
  res.status(404).render("errors/error", {
    layout: false,
    message: "Page not found",
    code: "404",
    href: req.session.user ? `/main/${req.session.user.id}` : "/",
  });
});

app.get("/favicon.ico", (req, res) => res.status(204).end());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
