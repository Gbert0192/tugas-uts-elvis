// middleware/auth.js
const isAuthenticated = (req, res, next) => {
  if (req.session.isAuthenticated) {
    return next(); // Jika terautentikasi, lanjutkan ke rute berikutnya
  }
  res.redirect("/"); // Jika tidak, arahkan ke halaman login
};

module.exports = { isAuthenticated };
