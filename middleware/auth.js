// middleware/auth.js
const isAuthenticated = (req, res, next) => {
  // Misalkan Anda menyimpan status autentikasi di req.session.isAuthenticated
  if (req.session.isAuthenticated) {
    return next(); // Jika terautentikasi, lanjutkan ke rute berikutnya
  }
  // Jika tidak terautentikasi, arahkan ke halaman login
  res.redirect("/");
};

module.exports = { isAuthenticated };
