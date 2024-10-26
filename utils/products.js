const fs = require("fs");
//ini buat bikin folder kalau blm ada folder data di root aja
const dirPath = "./data";
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath);
}
//ini buat bikin file users.json
const dataPath = "./data/products.json";
if (!fs.existsSync(dataPath)) {
  fs.writeFileSync(dataPath, "[]", "utf-8");
}

//ini buat load data users
const loadproducts = () => {
  const buffers = fs.readFileSync(dataPath, "utf-8");
  const users = JSON.parse(buffers);
  return users;
};

module.exports = { loadproducts };
