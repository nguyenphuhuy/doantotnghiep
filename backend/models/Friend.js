const mongoose = require("mongoose");

const friendSchema = new mongoose.Schema({
    userId1: {
        type: mongoose.Schema.Types.ObjectId,
        required: "userId1 is required",
        ref: "User"
    },
    userId2: {
        type: mongoose.Schema.Types.ObjectId,
        required: "userId2 is required",
        ref: "User"
    }
});

module.exports = mongoose.model("Friend", friendSchema);