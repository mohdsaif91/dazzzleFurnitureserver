const express = require("express");
const router = express.Router();
const categorySchema = require("../models/category");
const categoryController = require("../controllers/CategoryController");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const multer = require("multer");
const ObjectId = require("mongodb").ObjectID;
const productSchema = require("../models/productModal");

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
const editUpload = multer({ storage }).single("editedImage");

router.post("/add", upload, async (req, res) => {
  let imageData = "";
  try {
    let fileName = req.file.originalname.split(".");
    const myFileType = fileName[fileName.length - 1];
    const imageName = `${uuidv4()}.${myFileType}`;
    const Key = `category/${imageName}`;
    const params = {
      Bucket: process.env.BUCKET,
      Key,
      Body: req.file.buffer,
      ACL: "public-read-write",
    };
    console.log(params);
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

//update Categorey
router.patch("/updateCategory", editUpload, async (req, response) => {
  try {
    const {
      editedImage,
      oldCategoryName,
      imageName,
      categoryId,
      editedcategoryName,
    } = req.body;
    let updatedData = {};
    const updateImageFlage = false;
    //with Image
    if (!editedImage) {
      let fileName = req.file.originalname.split(".");
      const myFileType = fileName[fileName.length - 1];
      const newImageName = `${uuidv4()}.${myFileType}`;
      const removeKey = `category/${imageName}`;
      const addKey = `category/${newImageName}`;
      const params = {
        Bucket: process.env.BUCKET,
        Key: removeKey,
        Body: req.file.buffer,
        ACL: "public-read-write",
      };
      const updateParam = {
        Bucket: process.env.BUCKET,
        Key: addKey,
        Body: req.file.buffer,
        ACL: "public-read-write",
      };

      try {
        s3.deleteObject(
          { Bucket: process.env.BUCKET, Key: removeKey },
          (err, res) => {
            if (err) {
              console.log("1 ", err);
              throw err;
            }
            console.log(res, "----delete response <>?");
            s3.upload(updateParam, async (err, data) => {
              if (err) {
                console.log("2 ", err);
                throw err;
              }
              console.log(data, " imageUpload");
              await categorySchema.findOneAndUpdate(
                { _id: new ObjectId(categoryId) },
                {
                  categoryName: editedcategoryName,
                  imageName: newImageName,
                },
                { returnOriginal: false },
                (err, data) => {
                  if (err) {
                    console.log("3 ", err);
                    throw err;
                  }
                  updatedData = data;
                  console.log(data, " data<>?");
                  // response.status(201).send(data);
                }
              );
              const myQuery = { categoryName: oldCategoryName };
              const newValue = { $set: { categoryName: editedcategoryName } };
              await productSchema.updateMany(
                { categoryName: oldCategoryName },
                { $set: { categoryName: editedcategoryName } },
                (err, data) => {
                  if (err) {
                    console.log("3 ", err);
                    throw err;
                  }
                  // console.log(data);
                  response.status(201).send(updatedData);
                }
              );
            });
          }
        );
      } catch (error) {
        console.log(error, " 4");
        response.status(500).send(error);
      }
    } else {
      //without Image
      await categorySchema.findByIdAndUpdate(
        `${categoryId}`,
        { categoryName: editedcategoryName },
        { new: true },
        (err, data) => {
          if (err) throw err;
          updatedData = data;
          console.log(data, "<>?");
        }
      );

      await productSchema.updateMany(
        { categoryName: oldCategoryName },
        { $set: { categoryName: editedcategoryName } },
        (err, data) => {
          if (err) {
            console.log("3 ", err);
            throw err;
          }
          response.status(201).send(updatedData);
        }
      );
    }
  } catch (error) {
    console.log(error);
    response.status(500).send(error);
  }
});

router.get("/", categoryController.getCountCategory);
router.delete(
  "/delete/:id/:imageName/:categoryName",
  categoryController.deleteCategory
);

module.exports = router;
