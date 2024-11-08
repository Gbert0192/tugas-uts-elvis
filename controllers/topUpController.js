const userManager = require("../models/schemas/userManager");
const { generateTopUpCode } = require("../utils/generateOrderCode");
exports.getTopUpPage = async (req, res) => {
  const errorMessage = req.session.topUpWrongPw || null;
  const message = req.session.topUpMessages || null;

  // Reset session messages after retrieval
  req.session.topUpWrongPw = null;
  req.session.topUpMessages = null;

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

    res.render("topup", {
      layout: "partials/main",
      title: "TopUp Page",
      user,
      errorMessage,
      message,
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

exports.postTopUpPage = async (req, res) => {
  const requestedId = req.params.id;
  const loggedInUserId = req.user.id;
  let user;

  try {
    if (requestedId !== loggedInUserId) {
      return res.status(403).render("errors/error", {
        layout: false,
        code: "403",
        message: "Access Forbidden: Anda tidak dapat mengakses halaman ini.",
      });
    }

    const { noHp, amount, paymentMethod, password } = req.body;

    user = await userManager.findUserNoHp(noHp);

    if (!user) {
      return res.status(404).render("errors/error", {
        layout: false,
        message: "User tidak ditemukan",
        code: "404",
      });
    }

    // Verifikasi password
    const isPasswordValid = await userManager.passwordVerfication(
      noHp,
      password
    );
    if (!isPasswordValid) {
      req.session.topUpWrongPw = "Password Salah!";
      return res.redirect(`/main/${requestedId}/topup`);
    }

    const topUpAmount = parseFloat(amount);
    // Validasi jumlah top-up
    if (isNaN(topUpAmount) || topUpAmount <= 0) {
      req.session.topUpMessages =
        "Jumlah Top-Up tidak valid. Pastikan memasukkan angka yang benar.";
      return res.render("topup", {
        layout: "partials/main",
        title: "Top-Up Page",
        user,
        errorMessage: req.session.topUpMessages,
      });
    }

    setTimeout(async () => {
      user.balance[0].walletBalances += topUpAmount;

      const topUpEntry = {
        topUpId: generateTopUpCode(),
        amount: topUpAmount,
        paymentMethod: paymentMethod,
        date: new Date().toISOString(),
      };
      user.balance[1].topUpHistory.push(topUpEntry);
      await userManager.updateUser(user.id, user);

      req.session.topUpMessages = "Top-Up Berhasil";

      res.redirect(`/main/${requestedId}/topup`);
    }, 2000);
  } catch (error) {
    console.error("Error processing top-up:", error);
    return res.status(500).render("errors/error", {
      layout: false,
      message: "Terjadi kesalahan saat memproses top-up. " + error.message,
      code: "500",
    });
  }
};
