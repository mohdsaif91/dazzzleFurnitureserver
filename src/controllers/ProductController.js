const { v4: uuidv4 } = require("uuid");
const ObjectId = require("mongodb").ObjectID;
const { google } = require("googleapis");
const { Stream } = require("stream");

const productSchema = require("../models/productModal");

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

const addProduct = async (req, res) => {
  try {
    const fileName = req.file.originalname.split(".");
    const fileType = fileName[fileName.length - 1];
    if (req.file) {
      const id = uuidv4();
      const imageName = `${id}.${fileType}`;
      const Key = `product/${imageName}`;

      const { productName, productCategory } = req.body;

      const bufferedStream = new Stream.PassThrough();
      bufferedStream.end(req.file.buffer);

      const imageRes = await drive.files.create({
        requestBody: {
          name: imageName,
          mimeType: `image/${fileType}`,
        },
        media: {
          mimeType: `image/${fileType}`,
          body: bufferedStream,
        },
      });
      if (imageRes.data.id) {
        await drive.permissions.create({
          fileId: imageRes.data.id,
          requestBody: {
            role: "reader",
            type: "anyone",
          },
        });

        await productSchema.insertMany(
          {
            productImageName: imageRes.data.id,
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
      }
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

    const deleteRes = await drive.files.delete({
      fileId: imageName,
    });

    if (!deleteRes) {
      throw "Delete image operation failed";
    }

    await productSchema.deleteOne({ _id: new ObjectId(id) }, (err, data) => {
      if (err) throw err;
      res.status(200).json(id);
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

const updateProduct = async (req, res) => {
  let newImageName = "";
  let insertRes = "";
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

      const bufferedStream = new Stream.PassThrough();
      bufferedStream.end(req.file.buffer);

      const deleteRes = await drive.files.delete({
        fileId: editImageDisplay,
      });
      if (!deleteRes) {
        throw "deleting image operation failed";
      }
      insertRes = await drive.files.create({
        requestBody: {
          name: newImageName,
          mimeType: `image/${fileType}`,
        },
        media: {
          mimeType: `image/${fileType}`,
          body: bufferedStream,
        },
      });
      console.log(insertRes);
      if (insertRes.data.id) {
        await drive.permissions.create({
          fileId: insertRes.data.id,
          requestBody: {
            role: "reader",
            type: "anyone",
          },
        });
      }
    }
    await productSchema.findOneAndUpdate(
      {
        _id: new ObjectId(editProductId),
      },
      {
        productName: editProductName,
        categoryName: newEditCategoryName,
        productImageName: insertRes.data.id,
      },
      { new: true },
      (err, data) => {
        if (err) throw err;
        res.status(201).send(data);
      }
    );
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
