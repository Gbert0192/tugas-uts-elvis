const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session"); // Tambahkan ini
const { findUser, findUserId } = require("./utils/users");
const { loadProducts } = require("./utils/products");
const { isAuthenticated } = require("./middleware/auth"); // Pastikan Anda memiliki middleware ini

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
// Route untuk menampilkan halaman login
app.get("/", (req, res) => {
  const nomorHp = req.session.nomorHp || null; // Ambil nomor HP dari session
  const message = req.session.message || null; // Ambil pesan dari session
  req.session.message = null; // Hapus pesan dari session setelah diambil

  // Render halaman login dengan nomor HP dan pesan
  res.render("loginPage/login", {
    layout: "loginPage/mainLogin",
    title: "Login Page",
    message,
    nomorHp,
  });
});

// Proses login dan redirect
app.post("/main", (req, res) => {
  const result = findUser(req.body.noHp, req.body.password);
  // Jika password salah
  if (result === "Password salah") {
    req.session.message = "Password Salah, Mohon coba kembali";
    req.session.nomorHp = req.body.noHp;
    return res.redirect("/");
  }

  // Jika pengguna ditemukan
  if (result) {
    req.session.isAuthenticated = true; // Tandai pengguna sebagai terautentikasi
    req.session.userId = result.id; // Simpan ID pengguna ke session
    return res.redirect(`main/${result.id}`);
  }

  // Jika pengguna tidak ditemukan
  req.session.message = "User dengan nomor HP tidak ditemukan";
  return res.redirect("/");
});

// Menggunakan middleware checkAuth pada route /main/:id
app.get("/main/:id", isAuthenticated, (req, res) => {
  const requestedId = parseInt(req.params.id, 10); //ini ubah dari string ke integer
  const loggedInUserId = req.session.userId;

  const user = findUserId(requestedId);
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
        message: "Access Forbidden: You cannot access this page.",
      });
    }
  } else {
    return res.render("errors/error", {
      layout: false,
      message: "User not found",
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
