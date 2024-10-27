const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const { body, validationResult } = require("express-validator");

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

app.get("/register", (req, res) => {
  res.render("loginPage/register", {
    layout: "loginPage/mainLogin",
    title: "Register",
    method: "Sign In",
    href: "/",
  });
});

app.post(
  "/register",
  [
    body("noHp").isMobilePhone("id-ID").withMessage("Nomor HP tidak valid!"),
    body("email").isEmail().withMessage("Email tidak valid!"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    const hasErrors = !errors.isEmpty();

    const { noHp, email, nama, password } = req.body;

    if (hasErrors) {
      return res.render("loginPage/register", {
        layout: "loginPage/mainLogin",
        title: "Register",
        method: "Sign In",
        href: "/",
        hpMessage: "Nomor HP tidak valid",
        emailMessage: "Email tidak valid",
      });
    }

    const available = userManager.availableUsers(noHp);
    if (available) {
      return res.render("loginPage/register", {
        layout: "loginPage/mainLogin",
        title: "Register",
        method: "Sign In",
        href: "/",
        errors: [],
        message: "User Already Exists!",
      });
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

app.get("/main", (req, res) => {
  res.render("loginPage/homeNoLogin", {
    layout: "partials/main",
    title: "Main Page (without login)",
  });
});

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
