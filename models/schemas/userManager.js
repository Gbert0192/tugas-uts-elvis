const FileManager = require("../../utils/fileManager");
const { v4: uuidv4 } = require("uuid"); // Import uuid versi 4

class UserManager extends FileManager {
  constructor(dataPath) {
    super(dataPath); // Memanggil konstruktor superclass dengan dataPath
  }

  async findUser(noHp, password) {
    const users = await this.loadData(); // Menunggu hasil loadData
    const user = await users.find((user) => user.noHp === noHp);
    if (user) {
      if (user.password === password) {
        return user;
      }
      return false; // Password salah
    }
    return null; // User tidak ditemukan
  }

  async availableUsers(noHp, email) {
    const users = await this.loadData();
    return {
      noHpExists: users.some((user) => user.noHp === noHp),
      emailExists: users.some((user) => user.email === email),
    };
  }

  async addUser(user) {
    const users = await this.loadData();
    user.img = "";
    user.id = uuidv4();
    users.push(user);
    await this.saveData(users);
  }

  async findUserId(id) {
    const users = await this.loadData();
    return users.find((user) => user.id === id);
  }

  async updateUser(userId, updatedUser) {
    const users = await this.loadData();
    const index = users.findIndex((user) => user.id === userId);

    if (index === -1) {
      throw new Error("User not found");
    }

    users[index] = { ...users[index], ...updatedUser };

    await this.saveData(users);
  }
}

// Penggunaan
const dataPath = "./models/data/users.json";
const userManager = new UserManager(dataPath);
module.exports = userManager;
