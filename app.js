const express = require("express");
const app = express();

// Set EJS sebagai templating engine, jgn diubah!
app.set("view engine", "ejs");

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index"); // Ini akan merender views/index.ejs
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
