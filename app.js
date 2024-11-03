const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

// Function untuk menghandle user rendering - async
const userManager = require("./models/schemas/userManager");
// Function untuk menghandle product rendering - async
const productManager = require("./models/schemas/productManager");
// Middleware auth
const { isAuthenticated, secretKey } = require("./middleware/auth");

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(expressLayouts);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

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
app.post("/", async (req, res) => {
  try {
    const result = await userManager.findUser(req.body.noHp, req.body.password);

    if (result === null) {
      req.session.message = "User dengan nomor HP tidak ditemukan";
      req.session.nomorHp = req.body.noHp;
      return res.redirect("/");
    }

    if (result === false) {
      req.session.message = "Password Salah, Mohon coba kembali";
      req.session.nomorHp = req.body.noHp;
      return res.redirect("/");
    }

    const accessToken = jwt.sign({ id: result.id }, secretKey, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign({ id: result.id }, secretKey, {
      expiresIn: "7d",
    });

    res.cookie("refreshToken", refreshToken, { httpOnly: true });
    res.cookie("accessToken", accessToken, { httpOnly: true });
    req.session.nomorHp = result.noHp;

    console.log("Generated Access Token:", accessToken);
    console.log("Generated Refresh Token:", refreshToken);

    res.redirect(`/main/${result.id}`);
  } catch (error) {
    console.error("Error finding user:", error);
    req.session.message = "Terjadi kesalahan saat login.";
    return res.redirect("/");
  }
});

// Halaman register
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

// Proses register pengguna baru
app.post(
  "/register",
  [
    body("noHp").isMobilePhone("id-ID").withMessage("Nomor HP tidak valid!"),
    body("email").isEmail().withMessage("Email tidak valid!"),
    body("nama")
      .notEmpty()
      .withMessage("Nama tidak boleh kosong!")
      .matches(/^[A-Za-z\s]+$/)
      .withMessage("Nama hanya boleh berisi huruf dan spasi!"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password minimal 6 karakter!"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((err) => err.msg);
        req.session.messages = errorMessages;
        return res.redirect("/register");
      }
      const { noHp, email, nama, password, sex } = req.body;

      // Mengecek apakah pengguna sudah ada
      const { noHpExists, emailExists } = await userManager.availableUsers(
        noHp,
        email
      );
      req.session.messages = [];
      if (noHpExists) {
        req.session.messages.push("No HP sudah ada!");
      }
      if (emailExists) {
        req.session.messages.push("Email sudah ada!");
      }

      // Jika ada pesan kesalahan, kembali ke halaman register
      if (req.session.messages.length > 0) {
        return res.redirect("/register");
      }
      // Menambahkan pengguna baru
      await userManager.addUser({ noHp, email, nama, password, sex });
      req.session.message = "User berhasil ditambahkan!";
      return res.redirect("/");
    } catch (error) {
      console.error("Error adding user:", error);
      req.session.messages = ["Terjadi kesalahan saat mendaftar."];
      return res.redirect("/register");
    }
  }
);

// Mengambil data pengguna berdasarkan ID
app.get("/main/:id", isAuthenticated, async (req, res) => {
  const requestedId = req.params.id;
  const loggedInUserId = req.user.id;

  try {
    const user = await userManager.findUserId(requestedId);

    if (!user) {
      return res.status(404).render("errors/error", {
        layout: false,
        message: "User tidak ditemukan",
        code: "404",
      });
    }

    if (requestedId === loggedInUserId) {
      const stores = await productManager.loadStores();
      return res.render("homePage", {
        layout: "partials/main",
        title: "Main Page Login",
        user,
        stores,
      });
    } else {
      return res.status(403).render("errors/error", {
        layout: false,
        code: "403",
        message: "Access Forbidden: Anda tidak dapat mengakses halaman ini.",
      });
    }
  } catch (error) {
    console.error("Error loading products:", error);
    return res.status(500).render("errors/error", {
      layout: false,
      message: "Terjadi kesalahan saat memuat produk. " + error.message,
      code: "500",
    });
  }
});

app.post(
  "/main/:id/profile",
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
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.session.messages = errors.array().map((error) => error.msg);
      return res.redirect(`/main/${req.params.id}/profile`);
    }

    try {
      const userId = req.params.id;
      const {
        name,
        noHp,
        email,
        password,
        sex,
        oldNoHp,
        oldEmail,
        oldPassword,
      } = req.body;

      const user = await userManager.findUserId(userId);
      if (!user) {
        return res.status(404).send("User not found");
      }

      let updatedUser = { ...user };
      let messages = [];

      // Perbarui nama jika diubah
      if (name && name !== user.name) {
        updatedUser.name = name;
      }

      // Perbarui nomor HP jika diubah
      if (noHp && noHp !== oldNoHp) {
        const { noHpExists } = await userManager.availableUsers(noHp, email);
        if (noHpExists) {
          messages.push("No Hp sudah terdaftar"); // Tambahkan pesan ke array
        } else {
          updatedUser.noHp = noHp;
        }
      }

      // Cek dan perbarui email
      if (email && email !== oldEmail) {
        const { emailExists } = await userManager.availableUsers(noHp, email);
        if (emailExists) {
          messages.push("Email sudah terdaftar"); // Tambahkan pesan ke array
        } else {
          updatedUser.email = email;
        }
      }

      // Perbarui kata sandi jika diubah
      if (password && password !== oldPassword) {
        updatedUser.password = password;
      }

      // Perbarui jenis kelamin
      if (sex) {
        updatedUser.sex = sex;
      }

      // Jika ada pesan kesalahan, simpan dan redirect
      if (messages.length > 0) {
        req.session.messages = messages; // Simpan array pesan dalam session
        return res.redirect(`/main/${userId}/profile`);
      }

      // Simpan data pengguna yang diperbarui
      await userManager.updateUser(userId, updatedUser);

      // Set pesan sukses di sesi
      req.session.update = "Data User Updated!";

      res.redirect(`/main/${userId}/profile`);
    } catch (error) {
      console.error(error);
      res.status(500).render("errors/error", {
        layout: false,
        message: "Internal Server Error",
        code: "500",
      });
    }
  }
);

app.get("/main/:id/profile", isAuthenticated, async (req, res) => {
  try {
    const user = await userManager.findUserId(req.params.id);
    const messages = req.session.messages || []; // Ambil pesan dari session
    const updateMessage = req.session.update; // Ambil pesan update dari session
    req.session.messages = null; // Hapus pesan setelah diambil
    req.session.update = null; // Hapus pesan update setelah diambil

    if (!user) {
      return res.status(404).render("errors/error", {
        layout: false,
        message: "User tidak ditemukan",
        code: "404",
      });
    }

    res.render("profile", {
      layout: "partials/main",
      title: "Profile Page",
      user,
      messages, // Kirim pesan kesalahan ke template
      updateMessage, // Kirim pesan pembaruan ke template
    });
  } catch (error) {
    console.error("Error loading profile:", error);
    res.status(500).render("errors/error", {
      layout: false,
      message: "Terjadi kesalahan saat memuat profil. " + error.message,
      code: "500",
    });
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  req.session.nomorHp = null;
  req.session.message = "Anda telah logout.";
  console.log("logged out!!");
  res.redirect("/");
});

app.get("/main", (req, res) => {
  res.redirect("/register");
});

// Halaman 404 / Not Found
app.use((req, res) => {
  res.status(404).render("errors/error", {
    layout: false,
    message: "Page not found",
    code: "404",
  });
});

app.get("/favicon.ico", (req, res) => res.status(204).end());

// Menjalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
