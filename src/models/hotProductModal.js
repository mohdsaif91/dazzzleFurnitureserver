const mongoose = require("mongoose");

const hotProductModalSchema = mongoose.Schema({
  hotProductId: String,
});

const hotProductSchema = mongoose.model(
  "hotProductModal",
  hotProductModalSchema
);

module.exports = hotProductSchema;
