const mongoose = require("mongoose");
const FriendRequest = mongoose.model("FriendRequest");

exports.getAll = async (req, res) => {
    
    // res.json(data);
    const userid = req.params.id;
    const data = await FriendRequest.find({userSend: new mongoose.Types.ObjectId(userid) });
    res.json(data);
}

exports.getList = async (req, res) => {
    const userid = req.params.id;
    const data = await FriendRequest.find({userGet: new mongoose.Types.ObjectId(userid) });
    res.json(data);
}