const express = require("express");
const router = express.Router();
const multer = require("multer");
const productController = require("../controllers/ProductController");
const productSchema = require("../models/productModal");

const storage = multer.memoryStorage({
  destination: function (req, file, callBack) {
    callBack(null, "");
  },
});

const uploadProduct = multer({ storage }).single("productImage");
// const updateProduct = multer({ storage }).single("newEditImage");

router.get("/getRandomProduct", async (req, res) => {
  try {
    const randomProduct = await productSchema.aggregate([
      { $sample: { size: 5 } },
    ]);
    res.status(200).send(randomProduct);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/addProduct", uploadProduct, productController.addProduct);

router.delete("/:id/:imageName", productController.deleteProduct);
router.put("/update", uploadProduct, productController.updateProduct);
router.get("/Id", productController.getLatestProductId);
router.get("/getProductById/:id", productController.getProductById);
router.get("/", productController.getAllProduct);
router.get("/:category", productController.getProduct);

module.exports = router;
