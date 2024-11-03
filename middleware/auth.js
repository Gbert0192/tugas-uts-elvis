const jwt = require("jsonwebtoken");
const secretKey = "your_secret_key"; // Ganti dengan kunci rahasia Anda

const isAuthenticated = (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  if (!accessToken) {
    return res.status(401).render("errors/error", {
      layout: false,
      message: "Unauthorized - Silakan login untuk melanjutkan",
      code: "401",
    });
  }

  jwt.verify(accessToken, secretKey, (err, user) => {
    if (err) {
      if (refreshToken) {
        jwt.verify(refreshToken, secretKey, (err, user) => {
          if (err) {
            return res.status(403).render("errors/error", {
              layout: false,
              message: "Session expired. Please log in again.",
              code: "403",
            });
          }
          const newAccessToken = jwt.sign({ id: user.id }, secretKey, {
            expiresIn: "15m",
          });
          res.cookie("accessToken", newAccessToken, { httpOnly: true });
          req.user = user;
          next();
        });
      } else {
        return res.status(403).render("errors/error", {
          layout: false,
          message: "Forbidden - Anda tidak memiliki akses",
          code: "403",
        });
      }
    } else {
      req.user = user;
      next();
    }
  });
};

module.exports = { isAuthenticated, secretKey };
