const mongoose = require("mongoose");

const productModalSchema = mongoose.Schema({
  productId: { type: Number, required: true, unique: true },
  productImageName: { type: String, required: true },
  likeCount: { type: Number },
  categoryName: { type: String, required: true },
  productName: { type: String, required: true },
});

const productSchema = mongoose.model("productSchema", productModalSchema);
module.exports = productSchema;
