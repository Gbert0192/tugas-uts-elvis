const fs = require("fs").promises;

class FileManager {
  constructor(dataPath) {
    this.dataPath = dataPath;
    this.createDirAndFile();
  }

  async createDirAndFile() {
    const dirPath = "./models/data";
    try {
      await fs.mkdir(dirPath, { recursive: true });
      await fs.writeFile(this.dataPath, "[]", { flag: "wx" });
    } catch (error) {
      if (error.code !== "EEXIST") {
        console.error("Error creating directory or file:", error);
      }
    }
  }

  async loadData() {
    try {
      const data = await fs.readFile(this.dataPath, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      console.error("Error reading data from file:", error);
      throw new Error("Failed to load data");
    }
  }

  async saveData(data) {
    await fs.writeFile(this.dataPath, JSON.stringify(data, null, 2));
  }
}

module.exports = FileManager;
