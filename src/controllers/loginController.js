const loginSchema = require("../models/login");

const authLogin = async (req, res) => {
  try {
    const { userName, password } = req.body;
    const uName = await loginSchema.findOne({ userName });
    if (!uName) {
      res.status(400).json({
        message: "Incorrect useName",
      });
    }
    const pass = await loginSchema.findOne({ password });
    if (!pass) {
      res.status(400).json({
        message: "Incorrect password",
      });
    }
    res.status(200).json({
      message: "Login sucessfull",
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = { authLogin };
