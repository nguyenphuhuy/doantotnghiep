const mongoose = require("mongoose");

const FriendRequestSchema = new mongoose.Schema({
    userSend: {
        type: mongoose.Schema.Types.ObjectId,
        required: "userSend is required",
        ref: "User"
    },
    userGet: {
        type: mongoose.Schema.Types.ObjectId,
        required: "userGet is required",
        ref: "User"
    },
    status: {
        type: Number,
        required: "status is required"
    }
});

module.exports = mongoose.model("FriendRequest", FriendRequestSchema);