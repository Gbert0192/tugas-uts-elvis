const { validationResult } = require("express-validator");
const userManager = require("../models/schemas/userManager");
const productManager = require("../models/schemas/productManager");
const axios = require("axios");
const { priceToIdr, formatCurrency } = require("../utils/format");
const {
  getCategoryList,
  getCategorizedProducts,
} = require("../utils/categoryUtils");

// Mengambil data pengguna berdasarkan ID
exports.getUserData = async (req, res) => {
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
      try {
        const categoryList = await getCategoryList();
        const categorizedProducts = await getCategorizedProducts(categoryList);

        return res.render("homePage", {
          layout: "partials/mainSearch",
          title: "Main Page Login",
          user,
          categoryList,
          categorizedProducts,
          priceToIdr,
          formatCurrency,
        });
      } catch (error) {
        console.error("Error loading data:", error);
        return res.status(500).render("errors/error", {
          layout: false,
          message: "Terjadi kesalahan saat memuat produk. " + error.message,
          code: "500",
        });
      }
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
};

// Mengambil kategori dan menampilkan halaman kategori
exports.getCategory = async (req, res) => {
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
      try {
        const categoryList = await getCategoryList();

        return res.render("homePage", {
          layout: "partials/mainSearch",
          title: "Category",
          categoryList,
        });
      } catch (error) {
        console.error("Error loading categories:", error);
        return res.status(500).render("errors/error", {
          layout: false,
          message: "Terjadi kesalahan saat memuat kategori. " + error.message,
          code: "500",
        });
      }
    } else {
      return res.status(403).render("errors/error", {
        layout: false,
        code: "403",
        message: "Access Forbidden: Anda tidak dapat mengakses halaman ini.",
      });
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).render("errors/error", {
      layout: false,
      message: "Terjadi kesalahan saat memuat data pengguna. " + error.message,
      code: "500",
    });
  }
};

// Menampilkan halaman profil pengguna
exports.getUserProfile = async (req, res) => {
  const requestedId = req.params.id;
  const loggedInUserId = req.user.id;
  const updateMessage = req.session.update || null;
  const messages = req.session.messages || [];
  req.session.update = null;
  req.session.messages = null;

  try {
    if (requestedId !== loggedInUserId) {
      return res.status(403).render("errors/error", {
        layout: false,
        code: "403",
        message: "Access Forbidden: Anda tidak dapat mengakses halaman ini.",
      });
    }

    const user = await userManager.findUserId(requestedId);
    if (!user) {
      return res.status(404).render("errors/error", {
        layout: false,
        message: "User tidak ditemukan",
        code: "404",
      });
    }

    res.render("profile", {
      layout: "partials/main",
      title: "Profil Pengguna",
      user,
      updateMessage,
      messages,
    });
  } catch (error) {
    console.error("Error loading user profile:", error);
    return res.status(500).render("errors/error", {
      layout: false,
      message: "Terjadi kesalahan saat memuat profil. " + error.message,
      code: "500",
    });
  }
};

// Update profil pengguna
exports.updateUserProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.session.messages = errors.array().map((error) => error.msg);
    return res.redirect(`/main/${req.params.id}/profile`);
  }

  try {
    const userId = req.params.id;
    const { name, noHp, email, password, sex, oldNoHp, oldEmail, oldPassword } =
      req.body;

    // Mencari pengguna berdasarkan ID
    const user = await userManager.findUserId(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    let updatedUser = { ...user };
    let hasChanges = false;

    // Memperbarui nama jika ada perubahan
    if (name && name !== user.name) {
      updatedUser.name = name;
      hasChanges = true;
    }

    // Memperbarui nomor HP jika ada perubahan
    if (noHp && noHp !== oldNoHp) {
      const { noHpExists } = await userManager.availableUsers(noHp, email);
      if (noHpExists) {
        req.session.messages = ["No HP sudah terdaftar"];
        return res.redirect(`/main/${userId}/profile`);
      } else {
        updatedUser.noHp = noHp;
        hasChanges = true;
      }
    }

    // Memperbarui email jika ada perubahan
    if (email && email !== oldEmail) {
      const { emailExists } = await userManager.availableUsers(noHp, email);
      if (emailExists) {
        req.session.messages = ["Email sudah terdaftar"];
        return res.redirect(`/main/${userId}/profile`);
      } else {
        updatedUser.email = email;
        hasChanges = true;
      }
    }

    // Memperbarui password jika ada perubahan
    if (password && password !== oldPassword) {
      updatedUser.password = password;
      hasChanges = true;
    }

    // Memperbarui jenis kelamin jika ada perubahan
    if (sex && sex !== user.sex) {
      updatedUser.sex = sex;
      hasChanges = true;
    }

    // Memperbarui gambar jika ada perubahan
    if (req.file) {
      updatedUser.img = "/img/users/" + req.file.filename;
      hasChanges = true;
      req.session.uploadMessage = "Upload file berhasil!";
    }

    // Tidak ada perubahan untuk diperbarui
    if (!hasChanges) {
      req.session.messages = ["Tidak ada perubahan untuk diperbarui."];
      return res.redirect(`/main/${userId}/profile`);
    }

    // Menyimpan perubahan
    await userManager.updateUser(userId, updatedUser);
    req.session.update = "Profil berhasil diperbarui!";
    res.redirect(`/main/${userId}/profile`);
  } catch (error) {
    console.error("Error updating user:", error);
    req.session.messages = ["Terjadi kesalahan saat memperbarui profil."];
    return res.redirect(`/main/${req.params.id}/profile`);
  }
};

// Menangani pencarian produk
exports.searchHandle = async (req, res) => {
  const requestedId = req.params.id;
  const loggedInUserId = req.user.id;
  const query = req.query.query;

  try {
    const user = await userManager.findUserId(requestedId);

    if (!user) {
      return res.status(404).render("errors/error", {
        layout: false,
        message: "User tidak ditemukan",
        code: "404",
      });
    }

    if (!query) {
      return res.redirect(`/main/${loggedInUserId}`);
    }

    const response = await axios.get(
      `https://dummyjson.com/products/search?q=${query}`
    );
    const products = response.data.products;

    if (products.length === 0) {
      return res.render("categoryPage", {
        layout: "partials/categoryMain",
        title: "Search Product",
        products: [],
        message: `Product with Keyword ${query} not found :(`,
        user,
      });
    }

    res.render("categoryPage", {
      layout: "partials/categoryMain",
      title: "Search Product",
      products,
      query,
      user,
      priceToIdr,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).render("errors/error", {
      message: "Terjadi kesalahan saat pencarian.",
      code: "500",
    });
  }
};
