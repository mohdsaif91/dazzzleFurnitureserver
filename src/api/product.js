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
const updateProduct = multer({ storage }).single("newEditImage");

router.post("/add", uploadProduct, productController.addProduct);
router.get("/:category", productController.getProduct);
router.delete("/:id/:imageName", productController.deleteProduct);
router.patch("/", updateProduct, productController.updateProduct);
router.get("/Id", productController.getLatestProductId);

module.exports = router;
