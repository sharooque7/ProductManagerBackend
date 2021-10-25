const { validationResult } = require("express-validator");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sellerModel = require("../model/sellerModel");

exports.check = (req, res, next) => {
  res.send({ message: "Hiiiiii" });
};

exports.signup = (req, res, next) => {
  console.log(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("validation failed!.");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const email = req.body.email;
  const companyName = req.body.companyName;
  const companyLocation = req.body.companyLocation;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  bcrypt
    .hash(password, 12)
    .then((hashedPw) => {
      const seller = new sellerModel({
        companyName: companyName,
        companyLocation: companyLocation,
        email: email,
        password: hashedPw,
      });
      return seller.save();
    })
    .then((result) => {
      res.status(201).json({ message: "User created!", userId: result._id });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadUser;
  sellerModel
    .findOne({ email: email })
    .then((user) => {
      if (!user) {
        const error = new Error("A user with this email could not be found");
        error.statusCode = 401;
        throw error;
      }
      loadUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        const error = new Error("Wrong password");
        error.statusCode = 401;
        throw error;
      }
      const token = jwt.sign(
        {
          email: loadUser.email,
          userId: loadUser._id.toString(),
        },
        "myecommerceapp",
        { expiresIn: "1h" }
      );
      res.status(200).json({ token: token, userId: loadUser._id.toString() });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getUserStatus = (req, res, next) => {
  sellerModel
    .findById(req.userId)
    .then((user) => {
      if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ status: user.status });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
