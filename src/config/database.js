const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://naveenkishore65:X2hCHCtxZP8jl4xz@cluster0.fchz7.mongodb.net/devTinder"
  );
};

module.exports = connectDB;
