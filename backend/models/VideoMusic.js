const mongoose = require("mongoose");

const videoMusicSchema = new mongoose.Schema({
    name: {
        type: String,
        required: "name is required",
    }
});

module.exports = mongoose.model("VideoMusic", videoMusicSchema);