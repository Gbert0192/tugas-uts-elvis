const userManager = require("../models/schemas/userManager");
const productManager = require("../models/schemas/productManager");

exports.getCartPage = async (req, res) => {
  const requestedId = req.params.id;
  const loggedInUserId = req.user.id;
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
