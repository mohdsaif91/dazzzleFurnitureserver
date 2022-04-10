const ProductModal = require("../models/productModal");
const HotProductModal = require("../models/hotProductModal");

const addHotproduct = async (req, res) => {
  try {
    if (!req.body.hotProductId) {
      res.status(403).send("please provide the Product ID !");
    }
    const updatedObj = await ProductModal.findByIdAndUpdate(
      `${req.body.hotProductId}`,
      {
        hotProduct: req.body.hotFlag,
      }
    );
    if (!updatedObj) {
      res.status(403).send("Update Hot product failed !");
    }
    const { hotProductId } = req.body;
    const hotUpdate = await HotProductModal.insertMany({ hotProductId });
    if (!hotUpdate) {
      res.status(403).send("Update Hot product failed !");
    }
    res.status(201).send(updatedObj);
  } catch (error) {
    res.status(500).send(error);
  }
};

module.exports = {
  addHotproduct,
};
