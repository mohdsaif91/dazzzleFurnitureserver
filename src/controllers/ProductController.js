const productSchema = require("../models/productModal");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const ObjectId = require("mongodb").ObjectID;
const fs = require("fs");

const ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID;
const SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new AWS.S3({
  accessKeyId: ACCESS_KEY,
  secretAccessKey: SECRET_KEY,
});

const allowedType = ["png", "jpg", "jpeg"];

const addProduct = async (req, res) => {
  try {
    const fileName = req.file.originalname.split(".");
    const fileType = fileName[fileName.length - 1];
    if (req.file) {
      const id = uuidv4();
      const imageName = `${id}.${fileType}`;
      const Key = `product/${imageName}`;
      const params = {
        Bucket: process.env.BUCKET,
        Key,
        Body: req.file.buffer,
        ACL: "public-read-write",
      };
      const { productName, productCategory } = req.body;
      await productSchema.insertMany(
        {
          productImageName: imageName,
          likeCount: 0,
          categoryName: productCategory,
          productName,
        },
        (err, data) => {
          if (err) {
            throw err;
          }

          s3.upload(params, (err, data) => {
            if (err) {
              res.status(400).send(err);
            }
          });
          res.status(201).send(data);
        }
      );
    }
  } catch (error) {
    res.status(500).send(error);
  }
};

const getProduct = async (req, res) => {
  try {
    const { category } = req.params;
    const product = await productSchema.find({ categoryName: category });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json(error);
  }
};

const deleteProduct = (req, res) => {
  try {
    const { id, imageName } = req.params;
    s3.deleteObject(
      {
        Bucket: process.env.BUCKET,
        Key: `product/${imageName}`,
      },
      async (err, data) => {
        if (err) {
          throw err;
        }
        await productSchema.deleteOne(
          { _id: new ObjectId(id) },
          (err, data) => {
            if (err) throw err;
            res.status(200).json(id);
          }
        );
      }
    );
  } catch (error) {
    res.status(500).send(error);
  }
};

const updateProduct = async (req, res) => {
  let newImageName = "";
  try {
    const {
      newEditCategoryName,
      editProductId,
      editImageDisplay,
      editProductName,
    } = req.body;
    if (req.file) {
      const fileName = req.file.originalname.split(".");
      const fileType = fileName[fileName.length - 1];
      newImageName = `${uuidv4()}.${fileType}`;
      const removeKey = `product/${editImageDisplay}`;
      const Key = `product/${newImageName}`;

      const updatedParams = {
        Bucket: process.env.BUCKET,
        Key,
        Body: req.file.buffer,
        ACL: "public-read-write",
      };

      s3.deleteObject(
        {
          Bucket: process.env.BUCKET,
          Key: removeKey,
        },
        (err, data) => {
          if (err) {
            throw err;
          }
          s3.upload(updatedParams, async (err, data) => {
            if (err) throw err;
          });
        }
      );
    }
    await productSchema.findOneAndUpdate(
      {
        _id: new ObjectId(editProductId),
      },
      {
        productName: editProductName,
        categoryName: newEditCategoryName,
        productImageName: newImageName,
      },
      { new: true },
      (err, data) => {
        if (err) throw err;
        res.status(201).send(data);
      }
    );
  } catch (error) {
    res.status(500).send(error);
  }
};

const getAllProduct = async (req, res) => {
  try {
    const product = await productSchema.find({});
    if (!product) {
      throw "get all product failed";
    }
    res.status(200).send(product);
  } catch (error) {
    res.status(500).send(error);
  }
};

const getLatestProductId = async (req, res) => {
  try {
    const allProduct = await productSchema.find({});
    res.status(200).send(allProduct[allProduct.length - 1]);
  } catch (error) {
    res.status(500).send(error);
  }
};

const getRandomProduct = async (req, res) => {
  return res.status(200).send("hi");
};

const getProductById = async (req, res) => {
  try {
    const byIdProduct = await productSchema.findById(req.params.id);
    if (!byIdProduct) {
      res.status(404).send("No Product found !");
    }
    res.status(200).send(byIdProduct);
  } catch (error) {
    res.status(500).send(error);
  }
};

module.exports = {
  addProduct,
  deleteProduct,
  getAllProduct,
  getLatestProductId,
  getProduct,
  getProductById,
  getRandomProduct,
  updateProduct,
};
