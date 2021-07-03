const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: "Title is required!",
  },
  content: {
    type: String,
    required: "Content is required!",
  },
});

module.exports = mongoose.model("Note", noteSchema);
