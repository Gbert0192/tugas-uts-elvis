const userManager = require("../models/schemas/userManager");
const { priceToIdr } = require("../utils/format");
const { getRandomDelivery } = require("../utils/randomDelivery");
const { generateOrderCode } = require("../utils/generateOrderCode");

exports.getCheckOutPage = async (req, res) => {
  const requestedId = req.params.id;
  const loggedInUserId = req.user.id;
  const cart = req.session.cart || [];
  const total = req.session.total || 0;

  const message = req.session.message || null;
  req.session.message = null;

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

    const orderFee = 2700;
    const storeFee = 3000;
    const userBalance = user.balance[0].walletBalances;

    res.render("checkout", {
      layout: false,
      title: "checkout product",
      user,
      cart,
      total,
      delivery: getRandomDelivery(),
      orderFee,
      storeFee,
      priceToIdr,
      message,
      userBalance,
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

//handle post cart dr front end
exports.handleCheckout = async (req, res) => {
  const { cart, total } = req.body;
  if (!cart || !cart.length) {
    return res
      .status(400)
      .json({ success: false, message: "Keranjang kosong" });
  }

  if (!total || typeof total !== "number") {
    return res
      .status(400)
      .json({ success: false, message: "Total tidak valid" });
  }

  req.session.cart = cart;
  req.session.total = total;

  // console.log("Cart diterima di backend:", cart);
  // console.log("Total diterima di backend:", total);

  return res.redirect(`/checkout/${req.params.id}`);
};

exports.confirmCheckout = async (req, res) => {
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

    const {
      alamatUser,
      alamatDetail,
      driverNotes,
      password,
      noHp,
      cart,
      shoppingTotal,
      paymentMethod,
    } = req.body;

    if (cart.length === 0) {
      return res.status(400).render("errors/error", {
        layout: false,
        message:
          "Keranjang belanja Anda kosong. Silakan tambahkan produk sebelum melanjutkan.",
      });
    }

    const verification = await userManager.passwordVerfication(noHp, password);
    if (verification === false) {
      req.session.message = "Password Salah, Mohon coba kembali";
      req.session.nomorHp = req.body.noHp;
      return res.redirect(`/checkout/${loggedInUserId}`);
    }

    if (paymentMethod === "Gopay") {
      if (user.balance[0].walletBalances < shoppingTotal) {
        req.session.message = "Saldo Tidak Mencukupi";
        return res.redirect(`/checkout/${loggedInUserId}`);
      }

      user.balance[0].walletBalances -= shoppingTotal;

      await userManager.updateUser(requestedId, { balance: user.balance });
    }

    const newOrder = {
      orderId: generateOrderCode(),
      alamatUser,
      alamatDetail,
      driverNotes,
      shoppingTotal,
      date: new Date().toISOString(),
      cart: cart,
      paymentMethod,
    };

    await userManager.addOrderToHistory(requestedId, newOrder);

    res.render("checkoutDone", {
      layout: false,
      user,
    });
  } catch (error) {
    console.error("Error during checkout process:", error);
    return res.status(500).render("errors/error", {
      layout: false,
      message: "Terjadi kesalahan saat memproses checkout. " + error.message,
      code: "500",
    });
  }
};
