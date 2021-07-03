const mongoose = require("mongoose");
const { param } = require("../app");
const Friend = mongoose.model("Friend");
const User = mongoose.model("User");
const Message = mongoose.model("Message");
// db.messages.find({chatroom: ObjectId("5f7934715efa03154c0b4e20")}).sort({"time":-1}).limit(1)

exports.getAll = async (req, res) => {
    const data = await Friend.find({});
    res.json(data);
}

exports.getFrUser = async (req, res) => {
    const id = req.params.id;
    let ListFriend = [];
    const friended = await Friend.find({$or:[{userId1:id}, {userId2:id}] });
    const user = await User.find({});
    friended.forEach(Element => {
        if(Element.userId1 == id){
            ListFriend.push(Element.userId2.toString())
        }else{
            ListFriend.push(Element.userId1.toString())
        }
    });
    let arrResult = [];
    user.forEach((element,index) => {
        if(ListFriend.includes(element._id.toString())){
            // characters.splice(index,1);
            arrResult.push(element);
        }
    });
    arrResult.forEach((element,index) => {
        if(element._id == id){
            arrResult.splice(index, 1);
        }
    });
    // console.log(arrResult);
    var arrMess = [];
    var bar = new Promise((resolve, reject) => {
        let lastIndex = arrResult.length - 1;
        arrResult.forEach(async (element, index) => {
            let lastMessage = await Message.find({$or: [{chatroom: new mongoose.Types.ObjectId(element._id), user: new mongoose.Types.ObjectId(id) }
                , {chatroom: new mongoose.Types.ObjectId(id), user: new mongoose.Types.ObjectId(element._id) }] }).sort({"time":-1}).limit(1);
            
            if(lastMessage.length > 0){
                let obj = {};
                obj.userId = element._id;
                obj.message = lastMessage[0].message;
                obj.time = lastMessage[0].time;
                arrMess.push(obj);                
            }
            if(index === arrResult.length - 1) resolve();
        });
        
    });

    
    bar.then(() => {
        arrResult.push(arrMess);
        res.json(arrResult);
    })

    // console.log("ok");
    
}

const dost = async (array, id) => {
    
    
    return arrMess;
}