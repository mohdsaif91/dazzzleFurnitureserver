const express = require("express");

const login = require("./login");
const category = require("./category");
const product = require("./product");
const hotProduct = require("./hotProduct");

const router = express.Router();

router.use("/", login);
router.use("/category", category);
router.use("/product", product);
router.use("/hotProduct", hotProduct);

module.exports = router;
