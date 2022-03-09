const express = require("express");
const router = express.Router();

const HotProductController = require("../controllers/HotProductController");

router.post("/add", HotProductController.addHotproduct);

module.exports = router;
