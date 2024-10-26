const fs = require("fs");
//ini buat bikin folder kalau blm ada folder data di root aja
const dirPath = "./data";
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath);
}
//ini buat bikin file users.json
const dataPath = "./data/users.json";
if (!fs.existsSync(dataPath)) {
  fs.writeFileSync(dataPath, "[]", "utf-8");
}

//ini buat load data users
const loadUsers = () => {
  const buffers = fs.readFileSync(dataPath, "utf-8");
  const users = JSON.parse(buffers);
  return users;
};

//ini buat cari data users
const findUser = (noHp, password) => {
  const users = loadUsers();
  const filterUser = users.find(
    (user) => user.noHp === noHp && user.password === password
  );
  return filterUser;
};

const findUserId = (id) => {
  const users = loadUsers();
  const filterUser = users.find((user) => user.id === id);
  return filterUser;
};

module.exports = { loadUsers, findUser, findUserId };
