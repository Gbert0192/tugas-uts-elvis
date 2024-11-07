const FileManager = require("../../utils/fileManager"); // Mengimpor kelas FileManager

class ProductManager extends FileManager {
  constructor(dataPath) {
    super(dataPath);
  }

  async loadStores() {
    const data = await this.loadData();
    return data;
  }

  saveProducts(products) {
    this.saveData(products);
  }

  async findProductsByStoreId(storeId) {
    const stores = await this.loadData();

    const store = stores.find((store) => store.storeId === Number(storeId));

    if (store && store.products) {
      return store.products;
    }
    return [];
  }
}

// Penggunaan
const dataPath = "./models/data/products.json";
const productManager = new ProductManager(dataPath);

module.exports = productManager;
