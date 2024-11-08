function paymentFormat(value) {
  // Pengecekan nilai dan format sesuai keinginan
  switch (value) {
    case "creditCard":
      return "Credit Card";
    case "debitCard":
      return "Debit Card";
    case "paypal":
      return "PayPal";
    default:
      return value; // jika tidak ada yang sesuai, kembalikan nilai asli
  }
}

module.exports = { paymentFormat };
