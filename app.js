const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const { body, validationResult, check } = require("express-validator");

const userManager = require("./utils/users");
const { loadProducts } = require("./utils/products");
const { isAuthenticated } = require("./middleware/auth");

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(expressLayouts);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Inisialisasi middleware session
app.use(
  session({
    secret: "secret aja",
    resave: false,
    saveUninitialized: true,
  })
);

// Halaman login
app.get("/", (req, res) => {
  const nomorHp = req.session.nomorHp || null;
  const message = req.session.message || null;
  req.session.message = null;

  res.render("loginPage/login", {
    layout: "loginPage/mainLogin",
    title: "Login Page",
    message,
    nomorHp,
    method: "Register",
    href: "/register",
  });
});

// Proses login dan redirect
app.post("/", (req, res) => {
  const result = userManager.findUser(req.body.noHp, req.body.password);
  if (result === false) {
    req.session.message = "Password Salah, Mohon coba kembali";
    req.session.nomorHp = req.body.noHp;
    return res.redirect("/");
  }
  if (result) {
    req.session.isAuthenticated = true;
    req.session.userId = result.id;
    return res.redirect(`main/${result.id}`);
  }

  req.session.message = "User dengan nomor HP tidak ditemukan";
  return res.redirect("/");
});

//halaman register
app.get("/register", (req, res) => {
  const errorMessages = req.session.messages || null;

  req.session.messages = null;

  res.render("loginPage/register", {
    layout: "loginPage/mainLogin",
    title: "Register",
    method: "Sign In",
    href: "/",
    errorMessages,
  });
});

//proses register pengguna baru, jika berhasil , dialihkan ke login// proses post aja
app.post(
  "/register",
  [
    body("noHp").isMobilePhone("id-ID").withMessage("Nomor HP tidak valid!\n"),
    body("email").isEmail().withMessage("Email tidak valid!"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((err) => err.msg);
      req.session.messages = errorMessages;
      return res.redirect("/register");
    }

    const { noHp, email, nama, password } = req.body;

    const available = userManager.availableUsers(noHp);
    if (available) {
      req.session.messages = ["User Already Exists!"];
      return res.redirect("/register");
    }
    userManager.addUser({ noHp, email, nama, password });
    req.session.message = "User Added!";
    res.redirect("/");
  }
);

// Mengambil data pengguna berdasarkan ID
app.get("/main/:id", isAuthenticated, (req, res) => {
  const requestedId = parseInt(req.params.id, 10);
  const loggedInUserId = req.session.userId;

  const user = userManager.findUserId(requestedId);
  if (user) {
    if (requestedId === loggedInUserId) {
      const products = loadProducts();
      return res.render("loginPage/homePage", {
        layout: "partials/main",
        title: "Main Page Login",
        user,
        products,
      });
    } else {
      return res.status(403).render("errors/error", {
        layout: false,
        code: "403",
        message: "Access Forbidden: Anda tidak dapat mengakses halaman ini.",
      });
    }
  } else {
    return res.render("errors/error", {
      layout: false,
      message: "User tidak ditemukan",
      code: "404",
    });
  }
});

//halaman /main
app.get("/main", (req, res) => {
  res.render("loginPage/homeNoLogin", {
    layout: "partials/main",
    title: "Main Page (without login)",
  });
});

//halaman 404/ not found
app.use((req, res) => {
  res.status(404).render("errors/error", {
    layout: false,
    message: "Page not found",
    code: "404",
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
