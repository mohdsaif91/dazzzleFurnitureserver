const { v4: uuidv4 } = require("uuid");
const ObjectId = require("mongodb").ObjectID;
const { google } = require("googleapis");
const { Stream } = require("stream");
const {
  S3Client,
  PutObjectCommand,
  S3,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");

const productSchema = require("../models/productModal");

const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const region = process.env.REGION;
const Bucket = process.env.BUCKET;

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

const client = new S3Client({
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  region,
});

const addProduct = async (req, res) => {
  try {
    const fileName = req.file.originalname.split(".");
    const fileType = fileName[fileName.length - 1];
    console.log(fileName);
    if (req.file) {
      const { productName, categoryName } = req.body;
      const id = uuidv4();
      const imageName = `${id}.${fileType}`;
      const insertImageKey = `product/${imageName}`;

      const insertParams = {
        Bucket,
        Key: insertImageKey,
        Body: req.file.buffer,
        ACL: "public-read-write",
      };

      const insertCommand = new PutObjectCommand(insertParams);
      const updateResponse = await client.send(insertCommand);
      if (!updateResponse) {
        return res.status(500).json({ message: "Image inertion failed" });
      }

      await productSchema.insertMany(
        {
          productName,
          categoryName,
          productImageName: imageName,
        },
        (err, data) => {
          if (err) throw err;
          return res.status(201).send({
            _id: data[0]._id,
            productName,
            categoryName,
            productImageName: imageName,
            likeCount: 0,
            hotProduct: false,
          });
        }
      );

      //     await productSchema.insertMany(
      //       {
      //         productImageName: imageRes.data.id,
      //         likeCount: 0,
      //         categoryName: productCategory,
      //         productName,
      //       },
      //       (err, data) => {
      //         if (err) {
      //           throw err;
      //         }
      //         res.status(201).send(data);
      //       }
      //     );
      //   }
    } else {
      return res.status(400).json({ message: "No Image Provided" });
    }
  } catch (error) {
    console.log(error);
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

const deleteProduct = async (req, res) => {
  try {
    const { id, imageName } = req.params;

    const deleteParams = {
      Bucket,
      Key: `product/${imageName}`,
    };
    const deleteCommand = new DeleteObjectCommand(deleteParams);
    const deleteObject = await client.send(deleteCommand);
    if (!deleteObject) {
      return res.status(500).json({ message: "Delete image operation failed" });
    }
    await productSchema.deleteOne({ _id: new ObjectId(id) }, (err, data) => {
      if (err) throw err;
    });
    return res.status(200).json(id);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

const updateProduct = async (req, res) => {
  try {
    const s3 = new S3({
      region,
      accessKeyId,
      secretAccessKey,
    });
    if (req.file.buffer) {
      const fileName = req.file.originalname.split(".");
      const fileType = fileName[fileName.length - 1];
      const newImageName = `${uuidv4()}.${fileType}`;

      if (req.file.originalname !== req.body.productImageName) {
        const deleteParams = {
          Bucket,
          Key: `product/${req.body.productImageName}`,
        };
        const deleteCommand = new DeleteObjectCommand(deleteParams);
        const deleteObject = await client.send(deleteCommand);
        if (!deleteObject) {
          return res
            .status(500)
            .json({ message: "Delete image operation failed" });
        }
        const updateParams = {
          Bucket,
          Key: `product/${newImageName}`,
          Body: req.file.buffer,
          ACL: "public-read-write",
        };
        const updateCommand = new PutObjectCommand(updateParams);
        const updateResponse = await client.send(updateCommand);
        console.log(updateResponse, " JACK");
        if (!updateResponse) {
          return res
            .status(500)
            .json({ message: "Update image operation failed" });
        }
      }

      const updatedObj = {
        ...req.body,
        productImageName: newImageName,
      };

      await productSchema.findOneAndUpdate(
        {
          _id: new ObjectId(req.body._id),
        },
        {
          ...updatedObj,
        },
        { new: true },
        (err, data) => {
          if (err) throw err;
          res
            .status(201)
            .send({ ...data._doc, productImageName: newImageName });
        }
      );

      //   const bufferedStream = new Stream.PassThrough();
      //   bufferedStream.end(req.file.buffer);

      //   const deleteRes = await drive.files.delete({
      //     fileId: editImageDisplay,
      //   });
      //   if (!deleteRes) {
      //     throw "deleting image operation failed";
      //   }
      //   insertRes = await drive.files.create({
      //     requestBody: {
      //       name: newImageName,
      //       mimeType: `image/${fileType}`,
      //     },
      //     media: {
      //       mimeType: `image/${fileType}`,
      //       body: bufferedStream,
      //     },
      //   });
      //   console.log(insertRes);
      //   if (insertRes.data.id) {
      //     await drive.permissions.create({
      //       fileId: insertRes.data.id,
      //       requestBody: {
      //         role: "reader",
      //         type: "anyone",
      //       },
      //     });
      //   }
    }
    // await productSchema.findOneAndUpdate(
    //   {
    //     _id: new ObjectId(editProductId),
    //   },
    //   {
    //     productName: editProductName,
    //     categoryName: newEditCategoryName,
    //     productImageName: insertRes.data.id,
    //   },
    //   { new: true },
    //   (err, data) => {
    //     if (err) throw err;
    //     res.status(201).send(data);
    //   }
    // );
  } catch (error) {
    console.log(error);
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
