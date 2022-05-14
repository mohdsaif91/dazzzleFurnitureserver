const mongoose = require("mongoose");

const busniessModalSchema = mongoose.Schema({
  mobileNumber: String,
  emailId: String,
  address: String,
  facebookUrl: String,
  instagramUrl: String,
  whatsAppUrl: String,
});

const busniessModal = mongoose.model("busniessOinfo", busniessModalSchema);

module.exports = busniessModal;
