const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  chatroom: {
    type: mongoose.Schema.Types.ObjectId,
    required: "Chatroom is required!",
    ref: "Chatroom",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: "User is required!",
    ref: "User",
  },
  name: {
    type: String,
    required: "Name is required!",
  },
  message: {
    type: String,
    required: "Message is required!",
  },
  level: {
    type: Number
  },
  time: {
    type: Date,
    required: "time is required!",
  }
});

module.exports = mongoose.model("Message", messageSchema);
