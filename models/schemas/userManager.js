const FileManager = require("../../utils/fileManager");

class UserManager extends FileManager {
  constructor(dataPath) {
    super(dataPath); // Memanggil konstruktor superclass dengan dataPath
  }

  async passwordVerfication(noHp, password) {
    const users = await this.loadData();
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
    user.history = [];
    user.balance = [
      {
        walletBalances: 0,
      },
      {
        topUpHistory: [],
      },
    ];
    user.img = "";
    users.push(user);

    await this.saveData(users);
  }

  async findUserId(id) {
    const users = await this.loadData();
    return users.find((user) => user.id === id);
  }

  async findUserNoHp(noHp) {
    const users = await this.loadData();
    return users.find((user) => user.noHp === noHp);
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

  async addOrderToHistory(userId, order) {
    const users = await this.loadData();
    const user = users.find((user) => user.id === userId);

    if (!user) {
      throw new Error("User not found");
    }
    user.history.push(order);
    await this.saveData(users);
  }
}

// Penggunaan
const dataPath = "./models/data/users.json";
const userManager = new UserManager(dataPath);
module.exports = userManager;
