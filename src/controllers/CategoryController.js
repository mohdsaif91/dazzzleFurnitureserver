const ObjectId = require("mongodb").ObjectID;
const {
  S3Client,
  S3,
  DeleteObjectCommand,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const { v4: uuidv4 } = require("uuid");

const { google } = require("googleapis");

const categorySchema = require("../models/category");
const productSchema = require("../models/productModal");
const HotProductModal = require("../models/hotProductModal");
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const region = process.env.REGION;
const Bucket = process.env.BUCKET;

const authToClient = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRATE,
  process.env.REDIRECT_URL
);
const client = new S3Client({
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  region,
});

authToClient.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

const drive = google.drive({
  version: "v3",
  auth: authToClient,
});
//

const createCategory = (req, res) => {
  try {
    console.log(req.body.categoryName);
    console.log(req.file);
    let fileName = req.file.originalname.split(".");
    const myFileType = fileName[fileName.length - 1];
    const imageName = `${uuidv4()}.${myFileType}`;
    const Key = `category/${imageName}`;
    new Upload({
      client: new S3Client({
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
        region,
      }),
      params: {
        ACL: "public-read-write",
        Bucket,
        Key,
        Body: req.file.buffer,
        ContentType: req.file.mimeType,
      },
    })
      .done()
      .then((data) => {
        categorySchema.insertMany(
          {
            categoryName: req.body.categoryName,
            imageId: imageName,
          },
          (err, result) => {
            if (err) {
              throw err;
            }
            console.log(result, " <>");
            res.status(201).send({
              categoryName: req.body.categoryName,
              imageId: imageName,
              _id: result[0]._id,
            });
          }
        );
      })
      .catch((err) => {
        throw err;
      });
  } catch (error) {
    console.log(error);
  }
};

const getCategory = async (req, res) => {
  try {
    const allCategory = await categorySchema.find({});
    if (!allCategory) {
      throw "Category retrival failed";
    }
    res.status(200).send(allCategory);
  } catch (error) {
    res.status(500).json(error);
  }
};

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
    const { id, imageId } = req.body;

    const deleteparm = {
      Bucket,
      Key: `category/${imageId}`,
    };
    const deleteImageResponse = new DeleteObjectCommand(deleteparm);
    const deleteObj = await client.send(deleteImageResponse);
    if (deleteObj) {
      const deleteMongoRes = await categorySchema.deleteOne({ _id: id });
      if (deleteMongoRes.count === 1) {
        return res.status(200).json({ message: "Delete succed" });
      } else {
        return res
          .status(400)
          .json({ message: "Delete mongo operation failed" });
      }
    } else {
      return res.status(400).json({ message: "Delete Image operation failed" });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
  // try {
  //   const { id, imageName, categoryName, imageId } = req.params;
  //   const withSpace = categoryName.replace(/_/g, " ");
  //   const deleteResponse = await drive.files.delete({
  //     fileId: imageId,
  //   });
  //   if (!deleteResponse) {
  //     throw "delete operation failed";
  //   }
  //   await categorySchema.deleteOne(
  //     { _id: new ObjectId(id) },
  //     async (err, result) => {
  //       if (err) {
  //         throw err;
  //       }
  //     }
  //   );
  //   await productSchema.deleteMany({ categoryName: withSpace }, (err, data) => {
  //     if (err) throw err;
  //     res.status(200).json({ id, imageName });
  //   });
  // } catch (error) {
  //   res.status(204).json({ error });
  // }
};

const updateCategory = async (req, res) => {
  try {
    const s3 = new S3({
      region,
      accessKeyId,
      secretAccessKey,
    });

    let updateImageId = null;

    if (req.file.buffer) {
      let fileName = req.file.originalname.split(".");
      const myFileType = fileName[fileName.length - 1];
      const imageName = `${uuidv4()}.${myFileType}`;
      const updateImageKey = `category/${imageName}`;
      updateImageId = imageName;
      const deleteParams = {
        Bucket,
        Key: `category/${req.body.imageId}`,
      };

      console.log(deleteParams, " <>");
      const deleteCommand = new DeleteObjectCommand(deleteParams);
      const deleteObject = await s3.send(deleteCommand);
      if (!deleteObject) {
        return res
          .status(500)
          .json({ message: "Delete image operation failed" });
      }

      const updateParams = {
        Bucket: process.env.BUCKET,
        Key: updateImageKey,
        Body: req.file.buffer,
        ACL: "public-read-write",
      };

      const updateCommand = new PutObjectCommand(updateParams);

      const updateResponse = await client.send(updateCommand);
      if (!updateResponse) {
        return res
          .status(500)
          .json({ message: "Update image operation failed" });
      }
    }
    const { _id, imageId, ...restProps } = req.body;
    // const updatingData = await categorySchema.findById(_id);

    const updatedObj = {
      ...restProps,
      imageId: updateImageId ? updateImageId : imageId,
    };
    console.log(updatedObj, " <>");
    await categorySchema.updateOne(
      {
        _id: new ObjectId(_id),
      },
      updatedObj,
      (err, data) => {
        if (err) throw err;
        console.log("updated");
        return res.status(201).send(data);
      }
    );
  } catch (error) {
    console.log(error, " <>");
    return res.status(500).json({ error });
  }
};

module.exports = {
  getCountCategory,
  getCategory,
  deleteCategory,
  createCategory,
  updateCategory,
};
