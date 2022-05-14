const nodeMailer = require("nodemailer");

const loginSchema = require("../models/login");
const busniessModal = require("../models/busniessModal");

const getBusniessInfo = async (req, res) => {
  try {
    const gotBusniessInfo = await busniessModal.find({});
    if (!gotBusniessInfo) {
      throw "Get operation failed ! ";
    }
    res.status(200).send(gotBusniessInfo[0]);
  } catch (error) {
    res.status(500).send(error);
  }
};

const sendBusniessInfo = async (req, res) => {
  try {
    console.log(req.body);
    const savedValue = await busniessModal.updateOne(
      { _id: "627e49316054331590c8b67a" },
      req.body
    );
    if (!savedValue) {
      throw "Update operation failed !";
    }
    res.status(200).send("update Operation success");
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

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

const sendEnquery = async (req, res) => {
  try {
    const transporter = nodeMailer.createTransport({
      service: "gmail",
      auth: {
        user: "Dazzlefurnitureworld@gmail.com",
        pass: "7208448414",
      },
    });
    let message = {
      from: "Dazzlefurnitureworld@gmail.com",
      to: "Dazzlefurnitureworld@gmail.com",
      subject: "New enquery from customer",
      html: `<h1>Customer Name: ${req.body.customerName}</h1>
          <h3>Mobile Number: ${req.body.mobileNumber}</h3>        
          <div>Customer Message: ${req.body.message}</div>        
      `,
    };
    transporter.sendMail(message, (err, info) => {
      if (err) {
        console.log(err);
      } else {
        res.status(200).send("Email Send !");
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

module.exports = {
  authLogin,
  createlogin,
  getBusniessInfo,
  sendEnquery,
  sendBusniessInfo,
};
