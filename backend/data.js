
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// This represents the data structure of the recipes collection in the database 
const DataSchema = new Schema(
  {
    name: String,
    description: String,
    location: String,
    category: String,
    mealType: String,
    ratings : Object,
    avgRating: Number, 
    comments: Array,
  },
  { timestamps: true }
);

// export the new Schema
module.exports = mongoose.model("recipes", DataSchema,"recipes");