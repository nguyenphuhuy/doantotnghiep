const mongoose = require("mongoose");
const Message = mongoose.model("Message");

// query find the lastest message
// db.messages.find({chatroom: ObjectId("5f7934715efa03154c0b4e20")}).sort({"time":-1}).limit(1)

exports.getAllMessage = async (req, res) => {
  const id = req.params.id;
  const result = Message.find({})
};

exports.insertTest = async (req, res) => {
    const newMessage = new Message({
        chatroom: new mongoose.Types.ObjectId("5f7934715efa03154c0b4e20"),
        user: new mongoose.Types.ObjectId("5fc8461aab6bf812f8825c7d"),
        name: "adminhuy",
        message: "Hi There",
        time: new Date(Date.now()).toISOString()
    });
  
    await newMessage.save();
    res.send("Insert successfully");
}
