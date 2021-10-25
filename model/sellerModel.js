const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductModel = require("../model/Product");

const userSchema = new Schema({
  companyName: {
    type: String,
    required: true,
  },
  companyLocation: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "I am new!",
  },
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: "ProductModel",
    },
  ],
});

module.exports = mongoose.model("SellerModel", userSchema);
