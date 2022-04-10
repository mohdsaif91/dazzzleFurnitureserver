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
    res.status(500).send(error);
  }
};

const createlogin = async (req, res) => {
  try {
    const created = await loginSchema.insertMany(req.body);
    if (!created) {
      throw "Could not create the data";
    }
    res.status(201).send("User Created !");
  } catch (error) {
    res.status(500).send(error);
  }
};

module.exports = { authLogin, createlogin };
