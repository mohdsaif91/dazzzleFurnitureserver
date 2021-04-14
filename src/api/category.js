const express = require("express");
const router = express.Router();
const categorySchema = require("../models/category");
const categoryController = require("../controllers/CategoryController");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const multer = require("multer");

const ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID;
const SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new AWS.S3({
  accessKeyId: ACCESS_KEY,
  secretAccessKey: SECRET_KEY,
});

const storage = multer.memoryStorage({
  destination: function (req, file, callback) {
    callback(null, "");
  },
});

const upload = multer({ storage }).single("categoryImage");

router.post("/add", upload, async (req, res) => {
  let imageData = "";
  try {
    let fileName = req.file.originalname.split(".");
    const myFileType = fileName[fileName.length - 1];
    const imageName = `${uuidv4()}.${myFileType}`;
    const Key = `categories/${imageName}`;
    const params = {
      Bucket: process.env.BUCKET,
      Key,
      Body: req.file.buffer,
      ACL: "public-read-write",
    };

    s3.upload(params, (err, data) => {
      if (err) {
        res.status(400).send(err);
      }
      imageData = data;
    });
    const { categoryName } = req.body;
    const newCategory = await categorySchema.insertMany(
      {
        categoryName,
        imageName,
      },
      (err, data) => {
        if (err) {
          throw err;
        }
        res.status(201).send(data);
      }
    );
  } catch (error) {
    console.log(error);
  }
});

router.get("/", categoryController.getCountCategory);

module.exports = router;
