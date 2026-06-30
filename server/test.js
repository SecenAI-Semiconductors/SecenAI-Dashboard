require("dotenv").config();

const mongoose = require("mongoose");

console.log(process.env.MONGO_URI);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected Successfully");
  })
  .catch((err) => {
    console.error(err);
  });