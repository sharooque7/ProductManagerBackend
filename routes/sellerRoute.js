const express = require("express");
const { body } = require("express-validator");
const isAuth = require("../middleware/is-auth");

const SellerModel = require("../model/sellerModel");

const router = express.Router();

const sellerController = require("../controller/sellerControllerAuth");

router.get("/check", sellerController.check);

router.post("/Login", sellerController.login);

router.put(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value, { req }) => {
        return SellerModel.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("E-Mail address already exist!");
          }
        });
      })
      .normalizeEmail(),
    body("password").trim().isLength({ min: 7 }),
    body("confirmPassword").trim().isLength({ min: 7 }),
    body("companyName").trim().not().isEmpty(),
    body("companyLocation").trim().not().isEmpty(),
  ],
  sellerController.signup
);

router.get("/auth/status", isAuth, sellerController.getUserStatus);

module.exports = router;
