const categorySchema = require("../models/category");
const ObjectId = require("mongodb").ObjectID;

const AWS = require("aws-sdk");

const ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID;
const SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new AWS.S3({
  accessKeyId: ACCESS_KEY,
  secretAccessKey: SECRET_KEY,
});

const getCountCategory = async (req, res) => {
  try {
    const category = await categorySchema.find({});
    res.status(200).json({ category });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id, imageName } = req.params;
    s3.deleteObject(
      { Bucket: process.env.BUCKET, Key: `categories/${imageName}` },
      async (err, s3Res) => {
        if (err) throw err;
        await categorySchema.deleteOne(
          { _id: new ObjectId(id) },
          (err, result) => {
            if (err) throw err;
            res.status(200).json({ id, imageName });
          }
        );
      }
    );
  } catch (error) {
    res.status(204).json({ error });
  }
};

module.exports = { getCountCategory, deleteCategory };
