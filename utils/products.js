const FileManager = require("./fileManager"); // Mengimpor kelas FileManager

class ProductManager extends FileManager {
  constructor(dataPath) {
    super(dataPath); // Memanggil konstruktor superclass dengan dataPath
  }

  async loadStores() {
    const data = await this.loadData(); // Memanggil loadData() jika diperlukan
    return data;
  }

  saveProducts(products) {
    this.saveData(products);
  }
}

// Penggunaan
const dataPath = "./data/products.json";
const productManager = new ProductManager(dataPath);

module.exports = productManager;
