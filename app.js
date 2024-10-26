const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session"); // Tambahkan ini
const { loadUsers, findUser, findUserId } = require("./utils/users");
const { loadProducts } = require("./utils/products");
const checkAuth = require("./middleware/auth"); // Pastikan Anda memiliki middleware ini
const productsRoutes = require("./routes/products");
const path = require("path");
const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(expressLayouts);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Inisialisasi middleware session
app.use(
  session({
    secret: "your_secret_key", // Ganti dengan kunci yang lebih aman
    resave: false,
    saveUninitialized: true,
  })
);

// Halaman login
app.get("/", (req, res) => {
  res.render("loginPage/login", {
    layout: "loginPage/mainLogin",
    title: "Login Page",
  });
});

// Proses login dan redirect
app.post("/main", (req, res) => {
  const user = findUser(req.body.noHp, req.body.password);
  if (user) {
    req.session.isAuthenticated = true; // Set status autentikasi
    req.session.userId = user.id; // Simpan ID pengguna di sesi
    res.redirect(`main/${user.id}`);
  } else {
    res.send(`<h1>User with ${req.body.noHp} Not Found</h1>`);
  }
});

// Middleware untuk mengecek autentikasi
const isAuthenticated = (req, res, next) => {
  if (req.session.isAuthenticated) {
    return next(); // Jika terautentikasi, lanjutkan ke rute berikutnya
  }
  res.redirect("/"); // Jika tidak, arahkan ke halaman login
};

// Menggunakan middleware checkAuth pada route /main/:id
app.get("/main/:id", isAuthenticated, (req, res) => {
  const requestedId = parseInt(req.params.id, 10); // ID yang diminta
  const loggedInUserId = req.session.userId; // ID pengguna yang sedang login

  // Cek apakah pengguna dengan ID yang diminta ada
  const user = findUserId(requestedId);
  if (user) {
    if (requestedId === loggedInUserId) {
      // Jika ID sama, tampilkan halaman utama
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
        message: "Access Forbidden: You cannot access this page.",
      });
    }
  } else {
    // Jika pengguna tidak ditemukan, tampilkan halaman 404
    return res.render("errors/404", {
      layout: false,
      message: "User not found",
    });
  }
});

// Halaman utama tanpa login
app.get("/main", (req, res) => {
  res.render("loginPage/homeNoLogin", {
    layout: "partials/main",
    title: "Main Page (without login)",
  });
});

// Menangani 404 untuk route yang tidak ada
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
