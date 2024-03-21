var express = require("express");
var productHelper = require("../helpers/product-helpers");
var userHelper = require("../helpers/user-helpers");
var router = express.Router();

const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};

router.get("/", async function (req, res, next) {
  let cartCount = null;
  let user = req.session.user;
  if (user) {
    cartCount = await userHelper.getCartCount(req.session.user._id);
  }
  productHelper.getAllProducts().then((products) => {
    res.render("user/view-products", { products, user, cartCount });
  });
});

router.get("/login", function (req, res, next) {
  if (req.session.loggedIn) {
    res.redirect("/");
  } else {
    res.render("user/login", { LoginErr: req.session.loginErr });
    req.session.loginErr = false;
  }
});

router.get("/signup", function (req, res, next) {
  res.render("user/signup");
});

router.post("/signup", function (req, res, next) {
  userHelper.doSignup(req.body).then((response) => {
    req.session.loggedIn = true;
    req.session.user = response;
    res.redirect("/");
  });
});

router.post("/login", function (req, res, next) {
  userHelper.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.loggedIn = true;
      req.session.user = response.user;
      res.redirect("/");
    } else {
      req.session.loginErr = true;
      res.redirect("/login");
    }
  });
});

router.get("/logout", function (req, res, next) {
  req.session.destroy();
  res.redirect("/login");
});

router.get("/cart", verifyLogin, async function (req, res) {
  let products = await userHelper.getCartProducts(req.session.user._id);
  console.log(products);
  let user = req.session.user;
  res.render("user/cart", { products, user });
});

router.get("/add-to-cart/:id", function (req, res, next) {
  console.log("api call");
  userHelper.addToCart(req.params.id, req.session.user._id).then(() => {
    res.json({ status: true });
  });
});

router.post("/change-product-quantity", function (req, res, next) {
  userHelper.changeProductQuantity(req.body).then((response) => {
    res.json(response);
  });
});

router.post("/remove-cart-item", function (req, res, next) {
  userHelper.removeCartItem(req.body).then(() => {
    res.json(true);
  });
});

router.get("/place-order", verifyLogin, function (req, res, next) {
  res.render("user/place-order");
});
router.post("/place-order", function (req, res, next) {
  console.log(req.body);
  res.render("user/place-order");
});

module.exports = router;
