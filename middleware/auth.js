// middleware/auth.js
const isAuthenticated = (req, res, next) => {
  // Misalkan Anda menyimpan status autentikasi di req.session.isAuthenticated
  if (req.session.isAuthenticated) {
    return next();
  }
  res.redirect("/");
};

module.exports = { isAuthenticated };
