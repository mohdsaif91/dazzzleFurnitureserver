const categorySchema = require("../models/category");

const getCountCategory = async (req, res) => {
  try {
    const category = await categorySchema.find({});
    res.status(200).json({ category });
  } catch (error) {
    res.status(500).json({ error });
  }
};

module.exports = { getCountCategory };
