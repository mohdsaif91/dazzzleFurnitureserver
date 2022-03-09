const mongoose = require("mongoose");

const productModalSchema = mongoose.Schema({
  productImageName: { type: String, required: true },
  likeCount: { type: Number },
  categoryName: { type: String, required: true },
  productName: { type: String, required: true },
  hotProduct: { type: Boolean, default: false },
});

const productSchema = mongoose.model("productSchema", productModalSchema);
module.exports = productSchema;
