const { MongoClient } = require("mongodb");

const state = {
  dbState: null,
  collectionState: null,
};

module.exports.connect = function (callback) {
  const url = process.env.DATABASE_URL;
  const client = new MongoClient(url);
  async function run() {
    try {
      await client.connect();
      const database = client.db("shoppingStore");
      state.dbState = database;
      const productsCollection = database.collection("products");
      state.collectionState = productsCollection;
      callback();
    } catch (err) {
      console.log(err.stack);
    }
  }
  run().catch(console.dir);
};
module.exports.getCollection = function () {
  return state.collectionState;
};

module.exports.getdb = function () {
  return state.dbState;
};
