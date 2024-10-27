const fs = require("fs");

class FileManager {
  constructor(dataPath) {
    this.dataPath = dataPath;
    this.createDirAndFile();
  }

  createDirAndFile() {
    const dirPath = "./data";
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }
    if (!fs.existsSync(this.dataPath)) {
      fs.writeFileSync(this.dataPath, "[]", "utf-8");
    }
  }

  loadData() {
    const buffers = fs.readFileSync(this.dataPath, "utf-8");
    return JSON.parse(buffers);
  }

  saveData(data) {
    fs.writeFileSync(this.dataPath, JSON.stringify(data, null, 2));
  }
}

class UserManager extends FileManager {
  constructor(dataPath) {
    super(dataPath);
  }

  findUser(noHp, password) {
    const users = this.loadData();
    const user = users.find((user) => user.noHp === noHp);
    if (user) {
      if (user.password === password) {
        return user;
      }
      return false; // Password salah
    }
    return null; // User tidak ditemukan
  }

  availableUsers(noHp) {
    const users = this.loadData();
    return users.find((user) => user.noHp === noHp);
  }

  addUser(user) {
    const users = this.loadData();
    user.id = users.length + 1; // ID = panjang pengguna + 1
    users.push(user);
    this.saveData(users);
  }

  findUserId(id) {
    const users = this.loadData();
    return users.find((user) => user.id === id);
  }
}

// Penggunaan
const dataPath = "./data/users.json";
const userManager = new UserManager(dataPath);

module.exports = userManager;
