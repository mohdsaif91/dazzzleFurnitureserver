const express = require("express");
const router = express.Router();

const loginController = require("../controllers/loginController");

router.post("/login", loginController.authLogin);
router.post("/signUp", loginController.createlogin);

module.exports = router;
