var express = require("express");
var productHelper = require("../helpers/product-helpers");
const { response } = require("../app");
var router = express.Router();

/* GET users listing. */
router.get("/", function (req, res, next) {
  productHelper.getAllProducts().then((products) => {
    res.render("admin/view-products", { admin: true, products });
  });
});

router.get("/add-products", function (req, res, next) {
  res.render("admin/add-products", { admin: true });
});

router.post("/add-products", (req, res, next) => {
  productHelper.addProduct(req.body, (id) => {
    if (id) {
      let image = req.files.image;
      image.mv("./public/product-images/" + id + ".jpg", (err) => {
        if (!err) {
          productHelper.getAllProducts().then((products) => {
            res.render("admin/view-products", { admin: true, products });
          });
        } else {
          console.log(err);
        }
      });
    } else {
      console.log("Insertion failed");
    }
  });
});

router.get("/delete-product/:id", function (req, res) {
  let proId = req.params.id;
  console.log(proId);
  productHelper.deleteProduct(proId).then((response) => {
    console.log("deleted");
    res.redirect("/admin");
  });
});

router.get("/edit-product/:id", async function (req, res, next) {
  let product = await productHelper.getProductDetails(req.params.id);
  res.render("admin/edit-product", { product });
});

router.post("/edit-product/:id", function (req, res, next) {
  productHelper.updateProduct(req.params.id, req.body).then((response) => {
    res.redirect("/admin");
    if (req.files.image) {
      let id = req.params.id;
      let image = req.files.image;
      image.mv("./public/product-images/" + id + ".jpg");
    }
  });
});

module.exports = router;
