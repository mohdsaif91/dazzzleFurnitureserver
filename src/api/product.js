const express = require("express");
const router = express.Router();
const multer = require("multer");
const productController = require("../controllers/ProductController");

const storage = multer.memoryStorage({
  destination: function (req, file, callBack) {
    callBack(null, "");
  },
});

const uploadProduct = multer({ storage }).single("productImage");

router.post("/add", uploadProduct, productController.addProduct);
router.get("/", productController.getProduct);

module.exports = router;
