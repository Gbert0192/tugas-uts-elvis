const userManager = require("../models/schemas/userManager");
const { priceToIdr } = require("../utils/format");
const { paymentFormat } = require("../utils/paymentFormat");

exports.getProductHistoryPage = async (req, res) => {
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

    res.render("productHistory", {
      layout: "partials/main",
      title: "history",
      user,
      priceToIdr,
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

exports.getTopUpHistoryPage = async (req, res) => {
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

    res.render("topUpHistory", {
      layout: "partials/main",
      title: "history",
      topUpHistory: user.balance[1].topUpHistory,
      user,
      priceToIdr,
      paymentFormat,
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
