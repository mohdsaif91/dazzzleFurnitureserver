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
      const imageName = `${uuidv4()}.${fileType}`;
      const Key = `products/${imageName}`;
      const params = {
        Bucket: process.env.BUCKET,
        Key,
        Body: req.file.buffer,
        ACL: "public-read-write",
      };
      const allProductId = await productSchema.find({});
      const productId = allProductId[allProductId.length - 1].productId + 1;
      const { productName, productCategory } = req.body;
      console.log(productName, productCategory, productId);
      const newProduct = await productSchema.create(
        {
          productId,
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
    res.status(400).send(error);
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
        Key: `products/${imageName}`,
      },
      async (err, data) => {
        console.log("got it1");
        if (err) {
          throw err;
        }
        await productSchema.deleteOne(
          { _id: new ObjectId(id) },
          (err, data) => {
            console.log("got it2");
            if (err) throw err;
            res.status(200).json(id);
          }
        );
      }
    );
  } catch (error) {
    console.log(error);
  }
};

const updateProduct = (req, res) => {
  try {
    const {
      newEditCategoryName,
      editProductId,
      editImageDisplay,
      editProductName,
    } = req.body;
    console.log("called", req.body);
    if (req.file) {
      const fileName = req.file.originalname.split(".");
      const fileType = fileName[fileName.length - 1];
      const newImageName = `${uuidv4()}.${fileType}`;
      const removeKey = `products/${editImageDisplay}`;
      const Key = `products/${newImageName}`;

      const updatedParams = {
        Bucket: process.env.BUCKET,
        Key,
        Body: req.file.buffer,
        ACL: "public-read-write",
      };

      try {
        s3.deleteObject(
          {
            Bucket: process.env.BUCKET,
            Key: removeKey,
          },
          (err, data) => {
            if (err) throw err;
            console.log(res, "----delete response <>?");
            s3.upload(updatedParams, async (err, data) => {
              if (err) throw err;
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
            });
          }
        );
      } catch (error) {
        res.status(500).send(error);
      }

      console.log(
        newEditCategoryName,
        editProductId,
        editImageDisplay,
        editProductName,
        "<>?"
      );
    } else {
    }
  } catch (error) {
    console.log(error);
  }
};

const getLatestProductId = async () => {
  try {
    const allProduct = await productSchema.find({});
    res.status(200).send(allProduct[allProduct.length - 1]);
  } catch (error) {
    res.status(500).send(error);
  }
};

module.exports = {
  addProduct,
  getProduct,
  deleteProduct,
  updateProduct,
  getLatestProductId,
};
