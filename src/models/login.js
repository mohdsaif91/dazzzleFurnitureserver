const mongoose = require("mongoose");

const loginModalSchema = mongoose.Schema({
  userName: String,
  password: String,
});

const loginSchema = mongoose.model("loginSchema", loginModalSchema);

module.exports = loginSchema;
