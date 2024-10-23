const express = require("express");
const path = require("path");
const app = express();
const productsRoutes = require("./routes/products"); // Import routes

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index"); // Merender views/index.ejs
});

app.use("/products", productsRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
