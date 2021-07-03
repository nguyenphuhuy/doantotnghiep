const mongoose = require("mongoose");
const Note = mongoose.model("Note");

exports.getAll = async (req, res) => {
    const data = await Note.find({});
    res.json(data);
}
