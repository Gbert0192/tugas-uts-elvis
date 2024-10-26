const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const { loadUsers, findUser } = require("./utils/users");

const app = express();
// const productsRoutes = require("./routes/products");

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(expressLayouts);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//ini login page
app.get("/", (req, res) => {
  res.render("login", { layout: "loginPage/mainLogin", title: "Login Page" });
});

//login page redirect ke page main
app.post("/main", (req, res) => {
  const user = findUser(req.body.noHp);
  if (user) {
    res.redirect(`/main/${req.body.noHp}`);
  } else {
    res.send(`<h1>User with ${req.body.noHp} Not Found</h1>`);
  }
});

app.get("/main/:noHp", (req, res) => {
  const users = loadUsers();
  const products = loadproducts();
  const user = findUser(req.params.noHp);

  if (user) {
    res.render("loginPage/homePage", {
      layout: "partials/main",
      title: "Main Page Login",
      users,
      products,
    });
  } else {
    res.render("errors/404", {
      layout: false,
    });
  }
});

app.get("/main", (req, res) => {
  res.render("loginPage/homeNoLogin", {
    layout: "partials/main",
    title: "Main Page (without login)",
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
