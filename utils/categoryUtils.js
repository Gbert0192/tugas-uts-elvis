const axios = require("axios");

// Fungsi untuk mengambil daftar kategori
const getCategoryList = async () => {
  const response = await axios.get(
    "https://dummyjson.com/products/category-list"
  );
  return response.data;
};

// Fungsi untuk mengambil produk berdasarkan kategori
const getCategorizedProducts = async (categoryList) => {
  const categorizedProductsArray = await Promise.all(
    categoryList.map(async (category) => {
      const response = await axios.get(
        `https://dummyjson.com/products/category/${category}`
      );
      return { [category]: response.data.products };
    })
  );

  return Object.assign({}, ...categorizedProductsArray);
};

module.exports = { getCategoryList, getCategorizedProducts };
