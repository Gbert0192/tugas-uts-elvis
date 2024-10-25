const express = require("express");
const expressLayouts = require("express-ejs-layouts");

const app = express();
const productsRoutes = require("./routes/products"); // Import routes

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(expressLayouts);

app.get("/", (req, res) => {
  res.render("login", { layout: "partials/mainLogin", title: "Login Page" }); // Merender views/index.ejs
});

app.use("/products", productsRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
