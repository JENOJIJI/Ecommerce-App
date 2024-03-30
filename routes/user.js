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
  let totalPrice = 0;
  totalPrice = await userHelper.getTotalPrice(req.session.user._id);
  if (totalPrice.length <= 0) {
    totalPrice = 0;
  } else {
    totalPrice = totalPrice[0].total;
  }
  console.log(totalPrice);
  let totalItemsCount = await userHelper.getCartCount(req.session.user._id);
  let products = await userHelper.getCartProducts(req.session.user._id);
  let user = req.session.user;

  res.render("user/cart", { products, user, totalPrice, totalItemsCount });
});

router.get("/add-to-cart/:id", function (req, res, next) {
  userHelper.addToCart(req.params.id, req.session.user._id).then(() => {
    res.json({ status: true });
  });
});

router.post("/change-product-quantity", function (req, res, next) {
  userHelper.changeProductQuantity(req.body).then(async (response) => {
    response.totalPrice = await userHelper.getTotalPrice(req.body.user);
    res.json(response);
  });
});

router.post("/remove-cart-item", function (req, res, next) {
  userHelper.removeCartItem(req.body).then(() => {
    res.json(true);
  });
});

router.get("/place-order", verifyLogin, async function (req, res, next) {
  let totalPrice = await userHelper.getTotalPrice(req.session.user._id);
  let totalItemsCount = await userHelper.getCartCount(req.session.user._id);
  res.render("user/place-order", {
    totalItemsCount,
    totalPrice,
    user: req.session.user,
  });
});

router.post("/place-order", async function (req, res, next) {
  let products = await userHelper.getCartProductList(req.body.userId);
  let totalPrice = await userHelper.getTotalPrice(req.body.userId);
  userHelper.placeOrder(req.body, products, totalPrice).then((response) => {
    res.json({ status: true });
  });
});

router.get("/order-success", function (req, res, next) {
  res.render("user/order-success");
});

router.get("/orders", verifyLogin, async function (req, res, next) {
  let orders = await userHelper.getOrderDetails(req.session.user._id);
  console.log(orders);
  res.render("user/orders", { user: req.session.user, orders });
});

router.get("/view-order-products/:id", async function (req, res, next) {
  let products = await userHelper.getOrderedProducts(req.params.id);

  let orderDetails = await userHelper.getSpecificOrderDetails(req.params.id);
  console.log(orderDetails);
  res.render("user/ordered-products", { user: req.session.user, products,orderDetails });
});
module.exports = router;
