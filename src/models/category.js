const mongoose = require("mongoose");

const categoryModalSchema = mongoose.Schema({
  categoryName: String,
  imageId: String,
});

const categorySchema = mongoose.model("categorySchema", categoryModalSchema);

module.exports = categorySchema;
