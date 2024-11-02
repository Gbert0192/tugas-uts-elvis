const FileManager = require("./fileManager");

class UserManager extends FileManager {
  constructor(dataPath) {
    super(dataPath); // Memanggil konstruktor superclass dengan dataPath
  }

  async findUser(noHp, password) {
    const users = await this.loadData(); // Menunggu hasil loadData
    const user = users.find((user) => user.noHp === noHp);
    if (user) {
      if (user.password === password) {
        return user;
      }
      return false; // Password salah
    }
    return null; // User tidak ditemukan
  }

  async availableUsers(noHp) {
    const users = await this.loadData(); // Menunggu hasil loadData
    return users.find((user) => user.noHp === noHp);
  }

  async addUser(user) {
    const users = await this.loadData(); // Menunggu hasil loadData
    user.id = users.length + 1; // ID = panjang pengguna + 1
    users.push(user);
    await this.saveData(users); // Menunggu hasil saveData
  }

  async findUserId(id) {
    const users = await this.loadData(); // Menunggu hasil loadData
    return users.find((user) => user.id === id);
  }
}

// Penggunaan
const dataPath = "./data/users.json";
const userManager = new UserManager(dataPath);
module.exports = userManager;
