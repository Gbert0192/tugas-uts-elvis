const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session"); // Tambahkan ini
const { loadUsers, findUser, findUserId } = require("./utils/users");
const { loadProducts } = require("./utils/products");
const { isAuthenticated } = require("./middleware/auth"); // Pastikan Anda memiliki middleware ini
const productsRoutes = require("./routes/products");
const path = require("path");
const { title } = require("process");
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
  const message = req.session.message || null; // Ambil pesan dari session
  req.session.message = null; // Hapus pesan dari session setelah diambil

  res.render("loginPage/login", {
    layout: "loginPage/mainLogin",
    title: "Login Page",
    message, // Kirimkan pesan ke view
  });
});

// Proses login dan redirect
app.post("/main", (req, res) => {
  const result = findUser(req.body.noHp, req.body.password); // Menggunakan fungsi yang sudah dimodifikasi

  // Jika password salah
  if (result === "Password salah") {
    req.session.message = "Password Salah, Mohon coba kembali";
    return res.redirect("/");
  }

  // Jika pengguna ditemukan
  if (result) {
    req.session.isAuthenticated = true;
    req.session.userId = result.id;
    return res.redirect(`main/${result.id}`);
  }

  // Jika pengguna tidak ditemukan
  req.session.message = "User dengan nomor HP tidak ditemukan";
  return res.redirect("/");
});

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
    return res.render("errors/error", {
      layout: false,
      message: "User not found",
      code: "404",
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
