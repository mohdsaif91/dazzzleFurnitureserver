const express = require("express");
const router = express.Router();
const categorySchema = require("../models/category");
const categoryController = require("../controllers/CategoryController");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const ObjectId = require("mongodb").ObjectID;
const productSchema = require("../models/productModal");

const { google } = require("googleapis");
const { Stream } = require("stream");

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

const permission = {
  role: "read",
  type: "anyone",
};

const storage = multer.memoryStorage({
  destination: function (req, file, callback) {
    callback(null, "");
  },
});

const upload = multer({ storage }).single("categoryImage");
const editUpload = multer({ storage }).single("editedImage");
// , async (req, res) => {
//   let imageData = "";
//   try {
//     let fileName = req.file.originalname.split(".");
//     const myFileType = fileName[fileName.length - 1];
//     const imageName = `${uuidv4()}.${myFileType}`;
//     const Key = `category/${imageName}`;

//     const bufferedStream = new Stream.PassThrough();
//     bufferedStream.end(req.file.buffer);

//     const imageRes = await drive.files.create({
//       requestBody: {
//         name: imageName,
//         mimeType: `image/${myFileType}`,
//       },
//       media: {
//         mimeType: `image/${myFileType}`,
//         body: bufferedStream,
//       },
//     });
//     if (imageRes.data.id) {
//       await drive.permissions.create({
//         fileId: imageRes.data.id,
//         requestBody: {
//           role: "reader",
//           type: "anyone",
//         },
//       });
//       const { categoryName } = req.body;
//       const newCategory = await categorySchema.insertMany(
//         {
//           categoryName,
//           imageId: imageRes.data.id,
//         },
//         (err, data) => {
//           if (err) {
//             throw err;
//           }
//           res.status(201).send(data);
//         }
//       );
//     }
//   } catch (error) {
//     res.status(500).send(error);
//   }

router.post("/create", upload, categoryController.createCategory);
router.get("/", categoryController.getCategory);
router.patch("/update", upload, categoryController.updateCategory);

//update Categorey
router.patch("/updateCategory", editUpload, async (req, response) => {
  try {
    const {
      editedImage,
      oldCategoryName,
      imageName,
      imageId,
      categoryId,
      editedcategoryName,
    } = req.body;
    let updatedData = null;
    const updateImageFlage = false;
    //with Image
    if (!editedImage) {
      let fileName = req.file.originalname.split(".");
      const myFileType = fileName[fileName.length - 1];
      const newImageName = `${uuidv4()}.${myFileType}`;
      const removeKey = `category/${imageName}`;
      const addKey = `category/${newImageName}`;

      const bufferedStream = new Stream.PassThrough();
      bufferedStream.end(req.file.buffer);

      try {
        if (!imageId) {
          throw "please provide the image !";
        }
        const deleteResponse = await drive.files.delete({
          fileId: imageId,
        });
        if (!deleteResponse) {
          throw "delete operation failed";
        }
        const res = await drive.files.create({
          requestBody: {
            name: newImageName,
            mimeType: `image/${myFileType}`,
          },
          media: {
            mimeType: `image/${myFileType}`,
            body: bufferedStream,
          },
        });
        if (res.data.id) {
          await drive.permissions.create({
            fileId: res.data.id,
            requestBody: {
              role: "reader",
              type: "anyone",
            },
          });
          updatedData = await categorySchema.findOneAndUpdate(
            { _id: new ObjectId(categoryId) },
            {
              categoryName: editedcategoryName,
              imageId: res.data.id,
            },
            { returnOriginal: false }
          );
          if (!updatedData) {
            throw "DB update Failed";
          }
        } else {
          throw "Image upload failed !";
        }
        response.status(200).send(updatedData);
      } catch (error) {
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
        }
      );

      await productSchema.updateMany(
        { categoryName: oldCategoryName },
        { $set: { categoryName: editedcategoryName } },
        (err, data) => {
          if (err) {
            throw err;
          }
          response.status(201).send(updatedData);
        }
      );
    }
  } catch (error) {
    response.status(500).send(error);
  }
});

router.get("/", categoryController.getCountCategory);
router.delete(
  "/delete/:id/:imageName/:categoryName/:imageId",
  categoryController.deleteCategory
);
router.delete("/", categoryController.deleteCategory);

module.exports = router;
