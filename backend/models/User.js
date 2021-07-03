const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: "Name is required!",
    },
    email: {
      type: String,
      required: "Email is required!",
    },
    password: {
      type: String,
      required: "Password is required!",
    },
    img: {
      type:String,
      required: "Img is required"
    },
    detail:{
      type:String
    },
    volun:{
      type:Number,
    },
    level: {
      type:Number,
      required: "Level is required!"
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
