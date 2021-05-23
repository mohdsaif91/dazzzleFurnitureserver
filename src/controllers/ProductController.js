const productSchema = require("../models/productModal");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");

const ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID;
const SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new AWS.S3({
  accessKeyId: ACCESS_KEY,
  secretAccessKey: SECRET_KEY,
});

const allowedType = ["png", "jpg", "jpeg"];

const addProduct = (req, res) => {
  try {
    const fileName = req.file.originalname.split(".");
    const fileType = fileName[fileName.length - 1];
    if (req.file) {
      const imageName = `${uuidv4()}.${fileType}`;
      const Key = `products/${imageName}`;
      const params = {
        Bucket: process.env.BUCKET,
        Key,
        Body: req.file.buffer,
        ACL: "public-read-write",
      };
      s3.upload(params, async (err, data) => {
        if (err) {
          res.status(400).send(err);
        }
        const { productName, productCategory } = req.body;
        const newProduct = await productSchema.create(
          {
            productId: "df100",
            productImageName: imageName,
            likeCount: 0,
            categoryName: productCategory,
            productName,
          },
          (err, data) => {
            if (err) {
              throw err;
            }
            res.status(201).send(data);
          }
        );
      });
    }
  } catch (error) {
    res.status(400).send(error);
  }
};

const getProduct = async (req, res) => {
  try {
    const product = await productSchema.find({});
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = {
  addProduct,
  getProduct,
};
