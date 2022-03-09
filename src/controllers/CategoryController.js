const ObjectId = require("mongodb").ObjectID;
const AWS = require("aws-sdk");

const categorySchema = require("../models/category");
const productSchema = require("../models/productModal");
const HotProductModal = require("../models/hotProductModal");

const ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID;
const SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new AWS.S3({
  accessKeyId: ACCESS_KEY,
  secretAccessKey: SECRET_KEY,
});

const getCountCategory = async (req, res) => {
  try {
    // categoryName
    const category = await categorySchema.find({});
    const allProduct = await productSchema.find({});
    const hotProduct = allProduct.filter((f) => f.hotProduct);
    category.sort((a, b) => {
      return a.categoryName.localeCompare(b.categoryName);
    });
    let categoryCount = [];

    category.map((m) => {
      const cat = {
        name: "",
        count: 0,
      };
      cat.name = m.categoryName;
      allProduct.filter((f) => {
        if (f.categoryName === m.categoryName) {
          cat.count += 1;
        }
      });
      categoryCount.push(cat);
    });
    res.status(200).json({
      category,
      categoryCount,
      productCount: allProduct.length,
      hotProduct,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id, imageName, categoryName } = req.params;
    const withSpace = categoryName.replace(/_/g, " ");
    s3.deleteObject(
      { Bucket: process.env.BUCKET, Key: `category/${imageName}` },
      async (err, s3Res) => {
        if (err) throw err;
        console.log("1");
        await categorySchema.deleteOne(
          { _id: new ObjectId(id) },
          async (err, result) => {
            if (err) {
              console.log(err);
              throw err;
            }
            console.log("2");
          }
        );
        await productSchema.deleteMany(
          { categoryName: withSpace },
          (err, data) => {
            if (err) throw err;
            console.log("3");
            res.status(200).json({ id, imageName });
          }
        );
      }
    );
  } catch (error) {
    console.log(error);
    res.status(204).json({ error });
  }
};

module.exports = { getCountCategory, deleteCategory };
