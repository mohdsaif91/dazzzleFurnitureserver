const express = require("express");
const router = express.Router();

const loginController = require("../controllers/loginController");

router.post("/login", loginController.authLogin);
router.post("/login/send", loginController.sendEnquery);
router.post("/sendBusniessInfo", loginController.sendBusniessInfo);
router.get("/sendBusniessInfo", loginController.getBusniessInfo);
router.post("/signUp", loginController.createlogin);

module.exports = router;
