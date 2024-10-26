const express = require("express");
const router = express.Router();
const productsData = require("../data/products.json"); // Path menuju data produk

// Route untuk mengambil produk berdasarkan lokasi
router.get("/:location", (req, res) => {
  const location = req.params.location.toLowerCase();

  const locationData = productsData.find(
    (item) => item.location.toLowerCase() === location
  );

  if (locationData) {
    res.render("products", {
      location: locationData.location,
      products: locationData.products,
    });
  } else {
    res.status(404).render("404");
  }
});

module.exports = router;
