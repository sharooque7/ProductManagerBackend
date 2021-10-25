require("dotenv").config();
const path = require("path");
const cors = require("cors");

const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");

const sellerRoutes = require("./routes/sellerRoute");
const productRoutes = require("./routes/productRoute");
const PORT = process.env.PORT || 4000;

const app = express();
app.use(express.json());
app.use(cors());

const MONGO_DB = process.env.MONGO_DB_URI;
const fileStorage = multer.diskStorage({
  destination: (req, res, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use("/images", express.static(path.join(__dirname, "images")));

// app.use(cors());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS,GET,POST,PUT,DELETE,PATCH,"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  next();
});

app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single(
    "productImage"
  )
);

app.use("/seller", sellerRoutes);
app.use("/feed", productRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({
    message: message,
    data: data,
  });
});

mongoose
  .connect(MONGO_DB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    app.listen(PORT, () => {
      console.log(`On Port ${PORT}`);
    });
  })
  .catch((err) => console.log(err));
