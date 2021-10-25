const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const sellerModel = require("../model/sellerModel");

const postSchema = new Schema(
  {
    productName: {
      type: String,
      require: true,
    },
    productImage: {
      type: String,
      require: true,
    },
    price: {
      type: String,
      required: true,
    },
    productDescription: {
      type: String,
      required: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "SellerModel",
      required: true,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("product", postSchema);
