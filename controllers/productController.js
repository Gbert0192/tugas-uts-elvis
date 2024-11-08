const userManager = require("../models/schemas/userManager");
const { default: axios } = require("axios");
const { priceToIdr } = require("../utils/format");

exports.getStoreProductPage = async (req, res) => {
  const requestedId = req.params.id;
  const loggedInUserId = req.user.id;
  const storeId = req.params.storeId;
  const storeCategory = req.params.storeCategory;

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
    const productId = await axios.get(
      `https://dummyjson.com/products/${storeId}`
    );
    const productCategory = await axios.get(
      `https://dummyjson.com/products/category/${storeCategory}`
    );
    console.log(`https://dummyjson.com/products/${storeId}`);
    const product = productId.data;
    const category = productCategory.data.products;
    res.render("product", {
      layout: "partials/main",
      title: "Produk Toko",
      user,
      product,
      category,
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
