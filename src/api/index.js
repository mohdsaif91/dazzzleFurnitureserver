const express = require("express");

const login = require("./login");
const category = require("./category");

const router = express.Router();

router.use("/", login);
router.use("/category", category);

module.exports = router;
