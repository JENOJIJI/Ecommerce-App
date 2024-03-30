var db = require("../config/connection");
var collections = require("../config/collections");
const { response } = require("../app");
var ObjectId = require("mongodb").ObjectId;
module.exports = {
  addProduct: (product, callback) => {
    db.getCollection()
      .insertOne(product)
      .then((data) => {
        callback(data.insertedId.toString());
      });
  },
  getAllProducts: () => {
    return new Promise(async (resolve, reject) => {
      let products = await db.getdb().collection("products").find().toArray();

      resolve(products);
    });
  },
  deleteProduct: (productId) => {
    return new Promise((resolve, reject) => {
      db.getdb()
        .collection("products")
        .deleteOne({ _id: new ObjectId(productId) })
        .then((response) => {
          resolve(response);
        });
    });
  },
  getProductDetails: (productId) => {
    return new Promise((resolve, reject) => {
      db.getdb()
        .collection("products")
        .findOne({ _id: new ObjectId(productId) })
        .then((product) => {
          resolve(product);
        });
    });
  },
  updateProduct: (productId, productDetails) => {
    return new Promise((resolve, reject) => {
      db.getdb()
        .collection("products")
        .updateOne(
          { _id: new ObjectId(productId) },
          {
            $set: {
              product_name: productDetails.product_name,
              category: productDetails.category,
              description: productDetails.description,
              price: productDetails.price,
            },
          }
        )
        .then((response) => {
          resolve(response);
        });
    });
  },
};
