const express = require("express");
const { body } = require("express-validator");

const ProductModel = require("../model/Product");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

const productController = require("../controller/ProductController");

// router.post("/post", productController.feed);
//feed

//feed/posts
router.get("/posts", isAuth, productController.getPosts);

router.post(
  "/post",
  isAuth,
  [
    body("productName").trim(),
    body("productImage").trim(),
    body("price").trim(),
    body("productDescription").trim(),
  ],
  productController.createPost
);

router.get("/post/:postId", isAuth, productController.getPost);

router.delete("/post/:postId", isAuth, productController.deletePost);

router.put(
  "/post/:postId",
  isAuth,
  [
    body("productImage").trim(),
    body("price").trim(),
    body("productName").trim(),
    body("productImage").trim(),
  ],
  productController.updatePost
);
module.exports = router;
