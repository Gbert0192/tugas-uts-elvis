const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storagePath = path.join(__dirname, "../public/img/users");

if (!fs.existsSync(storagePath)) {
  fs.mkdirSync(storagePath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, storagePath);
  },
  filename: (req, file, cb) => {
    const userId = req.params.id || req.body.userId;
    const uniqueSuffix = `${userId}-profileimg${path.extname(
      file.originalname
    )}`;
    cb(null, uniqueSuffix);
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
