const categorySchema = require("../models/category");

const getCountCategory = async (req, res) => {
  try {
    const category = await categorySchema.find({});
    console.log(category);
    res.status(200).json({ category });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
};

module.exports = { getCountCategory };
