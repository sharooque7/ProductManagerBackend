const fs = require("fs");
const path = require("path");

const { validationResult } = require("express-validator");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sellerModel = require("../model/sellerModel");
const ProductModel = require("../model/Product");

exports.feed = (req, res, next) => {
  res.json({ Message: "Helllo" });
};

exports.createPost = (req, res, next) => {
  console.log(req.body);
  console.log(req.file);
  console.log(req.file.path);
  // console.log(req.userId);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed ,enter data is incorrect");
    error.statusCode = 422;
    throw error;
  }
  if (!req.file) {
    const error = new Error("No image provided");
    error.statusCode = 422;
    throw error;
  }

  const productImage = req.file.path;
  const productName = req.body.productName;
  const price = req.body.price;
  const productDescription = req.body.productDescription;
  let creator;
  const post = new ProductModel({
    productName: productName,
    productImage: productImage,
    price: price,
    productDescription: productDescription,
    creator: req.userId,
  });
  post
    .save()
    .then((result) => {
      console.log(req.userId);
      return sellerModel.findById(req.userId);
    })
    .then((user) => {
      creator = user;
      user.posts.push(post);
      return user.save();
    })
    .then((result) => {
      res.status(201).json({
        message: "Post created successfully",
        post: post,
        creator: { _id: creator._id, name: creator.name },
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 503;
      }
      next(err);
    });
};

exports.getPosts = (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  let totalItems;
  ProductModel.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return ProductModel.find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then((posts) => {
      res.status(200).json({
        message: "Fetched post successfully",
        posts: posts,
        totalItems: totalItems,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  ProductModel.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find the post.");
        error.statusCode = 404;
        throw error;
      }
      if (post.creator.toString() !== req.userId) {
        const error = new Error("Not authorized");
        error.statusCode = 403;
        throw error;
      }
      clearImage(post.productImage);
      return ProductModel.findByIdAndRemove(postId);
    })
    .then((result) => {
      return sellerModel.findById(req.userId);
    })
    .then((user) => {
      user.posts.pull(postId);
      return user.save();
    })
    .then((result) => {
      res.status(200).json({ message: "Deleted post" });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode;
      }
      next(err);
    });
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  console.log(postId);
  ProductModel.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find post.");
        error.statusCode = 404;
        throw error;
      }
      console.log(post);
      res.status(200).json({ message: "Post fetched.", post: post });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.updatePost = (req, res, next) => {
  // console.log(req.body);
  console.log(req.body);
  console.log(req.file);
  console.log(req.file.path);
  const postId = req.params.postId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 427;
    throw error;
  }
  const productName = req.body.productName;
  const productDescription = req.body.productDescription;
  const price = req.body.price;
  let productImage = req.body.productImage;
  if (req.file) {
    productImage = req.file.path;
  }
  console.log(productImage + "--");
  if (!productImage) {
    const error = new Error("No file picked.");
    error.statusCode = 422;
    throw error;
  }
  ProductModel.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find post.");
        error.statusCode = 404;
        throw error;
      }
      if (post.creator.toString() !== req.userId) {
        const error = new Error("Not authorized");
        error.statusCode = 403;
        throw error;
      }
      if (!productImage !== post.productImage) {
        clearImage(post.productImage);
      }
      post.productName = productName;
      post.productImage = productImage;
      post.productDescription = productDescription;
      post.price = price;
      return post.save();
    })
    .then((result) => {
      res.status(200).json({ message: "Post updated!", post: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
const clearImage = (filePath) => {
  console.log;
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => console.log(err));
};
