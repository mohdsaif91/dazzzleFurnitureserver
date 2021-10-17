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
const updateProduct = multer({ storage }).single("newEditImage");

router.get("/getRandomProduct", async (req, res) => {
  try {
    const randomProduct = await productSchema.aggregate([
      { $sample: { size: 5 } },
    ]);
    res.status(200).send(randomProduct);
  } catch (error) {
    console.log(error);
  }
});

router.post("/add", uploadProduct, productController.addProduct);
router.get("/:category", productController.getProduct);
router.delete("/:id/:imageName", productController.deleteProduct);
router.patch("/", updateProduct, productController.updateProduct);
router.get("/Id", productController.getLatestProductId);
// router.get("/getRandomProduct", productController.getRandomProduct);

module.exports = router;
