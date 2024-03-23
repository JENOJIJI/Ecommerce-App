var db = require("../config/connection");
var collections = require("../config/collections");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");
module.exports = {
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      userData.password = await bcrypt.hash(userData.password, 10);
      const userCollection = db
        .getdb()
        .collection("user")
        .insertOne(userData)
        .then(resolve(userData));
    });
  },

  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      let user = await db
        .getdb()
        .collection("user")
        .findOne({ email: userData.email });

      if (user) {
        bcrypt.compare(userData.password, user.password).then((status) => {
          if (status) {
            console.log("login Success");
            response.user = user;
            response.status = true;
            resolve(response);
          } else {
            console.log("ooooom");
            resolve({ status: false });
          }
        });
      } else {
        console.log("no user found");
        resolve({ status: false });
      }
    });
  },
  addToCart: (productId, userId) => {
    return new Promise(async (resolve, reject) => {
      let prodObj = {
        item: new ObjectId(productId),
        quantity: 1,
      };
      let userCart = await db
        .getdb()
        .collection(collections.CART_COLLECTION)
        .findOne({ user: new ObjectId(userId) });

      if (userCart) {
        let productExist = userCart.products.findIndex(
          (product) => product.item == productId
        );

        if (productExist != -1) {
          db.getdb()
            .collection(collections.CART_COLLECTION)
            .updateOne(
              {
                user: new ObjectId(userId),
                "products.item": new ObjectId(productId),
              },
              {
                $inc: { "products.$.quantity": 1 },
              }
            )
            .then((response) => {
              resolve();
            });
        } else {
          db.getdb()
            .collection(collections.CART_COLLECTION)
            .updateOne(
              { user: new ObjectId(userId) },
              {
                $push: { products: prodObj },
              }
            )
            .then((response) => {
              resolve();
            });
        }
      } else {
        let cartObj = {
          user: new ObjectId(userId),
          products: [prodObj],
        };
        db.getdb()
          .collection(collections.CART_COLLECTION)
          .insertOne(cartObj)
          .then((response) => {
            resolve();
          });
      }
    });
  },
  getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cartItems = await db
        .getdb()
        .collection(collections.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: new ObjectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collections.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
        ])
        .toArray();
      resolve(cartItems);
    });
  },
  getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let productCount = null;
      let cart = await db
        .getdb()
        .collection(collections.CART_COLLECTION)
        .findOne({ user: new ObjectId(userId) });
      if (cart) {
        productCount = cart.products.length;
      }
      resolve(productCount);
    });
  },
  changeProductQuantity: (data) => {
    count = parseInt(data.count);
    quantity = parseInt(data.quantity);
    return new Promise((resolve, reject) => {
      if (data.count == -1 && data.quantity == 1) {
        db.getdb()
          .collection(collections.CART_COLLECTION)
          .updateOne(
            { _id: new ObjectId(data.cart) },
            {
              $pull: { products: { item: new ObjectId(data.product) } },
            }
          )
          .then((response) => {
            resolve({ removeProduct: true });
          });
      } else {
        db.getdb()
          .collection(collections.CART_COLLECTION)
          .updateOne(
            {
              _id: new ObjectId(data.cart),
              "products.item": new ObjectId(data.product),
            },
            {
              $inc: { "products.$.quantity": count },
            }
          )
          .then((response) => {
            resolve({ status: true });
          });
      }
    });
  },
  removeCartItem: (data) => {
    return new Promise((resolve, reject) => {
      db.getdb()
        .collection(collections.CART_COLLECTION)
        .updateOne(
          {
            _id: new ObjectId(data.cartId),
          },
          {
            $pull: { products: { item: new ObjectId(data.productId) } },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },
  getTotalPrice: (userId) => {
    return new Promise(async (resolve, reject) => {
      let total = await db
        .getdb()
        .collection(collections.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: new ObjectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collections.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
          {
            $group: {
              _id: null,
              total: {
                $sum: {
                  $multiply: ["$quantity", { $toInt: "$product.price" }],
                },
              },
            },
          },
        ])
        .toArray();
      resolve(total[0].total);
    });
  },
};
