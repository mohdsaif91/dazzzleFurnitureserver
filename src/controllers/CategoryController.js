const ObjectId = require("mongodb").ObjectID;
const AWS = require("aws-sdk");
const { google } = require("googleapis");

const categorySchema = require("../models/category");
const productSchema = require("../models/productModal");
const HotProductModal = require("../models/hotProductModal");

const authToClient = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRATE,
  process.env.REDIRECT_URL
);

authToClient.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

const drive = google.drive({
  version: "v3",
  auth: authToClient,
});

// const ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID;
// const SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY;

// const s3 = new AWS.S3({
//   accessKeyId: ACCESS_KEY,
//   secretAccessKey: SECRET_KEY,
// });

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
      cat.count = allProduct.filter(
        (f) => f.categoryName === m.categoryName
      ).length;
      categoryCount.push(cat);
    });
    res.status(200).json({
      category,
      categoryCount,
      productCount: allProduct.length,
      hotProduct,
    });
  } catch (error) {
    res.status(500).json({ error });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id, imageName, categoryName, imageId } = req.params;
    const withSpace = categoryName.replace(/_/g, " ");
    const deleteResponse = await drive.files.delete({
      fileId: imageId,
    });
    if (!deleteResponse) {
      throw "delete operation failed";
    }
    await categorySchema.deleteOne(
      { _id: new ObjectId(id) },
      async (err, result) => {
        if (err) {
          throw err;
        }
      }
    );
    await productSchema.deleteMany({ categoryName: withSpace }, (err, data) => {
      if (err) throw err;
      res.status(200).json({ id, imageName });
    });
  } catch (error) {
    res.status(204).json({ error });
  }
};

module.exports = { getCountCategory, deleteCategory };
