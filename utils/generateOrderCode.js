const { v4: uuidv4 } = require("uuid");

function generateOrderCode() {
  const uuid = uuidv4(); // Generate UUID
  const shortUuid = uuid.split("-")[0]; // Ambil bagian pertama dari UUID (misalnya '78bda966')
  const orderCode = `GMT-${shortUuid}`; // Gabungkan dengan 'GMT-'
  return orderCode;
}

function generateTopUpCode() {
  const uuid = uuidv4(); // Generate UUID
  const shortUuid = uuid.split("-")[0]; // Ambil bagian pertama dari UUID (misalnya '78bda966')
  const orderCode = `GTU-${shortUuid}`; // Gabungkan dengan 'GMT-'
  return orderCode;
}

module.exports = { generateOrderCode, generateTopUpCode };
