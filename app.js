const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");

const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const topUpRoutes = require("./routes/topUp");
const storeProductPage = require("./routes/product");

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(expressLayouts);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(
  session({
    secret: "secret aja",
    resave: false,
    saveUninitialized: true,
  })
);

app.use("/", authRoutes);
app.use("/main", userRoutes);
app.use("/main", topUpRoutes);
app.use("/main", storeProductPage);

// Halaman 404 / Not Found
app.use((req, res) => {
  res.status(404).render("errors/error", {
    layout: false,
    message: "Page not found",
    code: "404",
    href: req.session.user ? `/main/${req.session.user.id}` : "/",
  });
});

app.get("/favicon.ico", (req, res) => res.status(204).end());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
