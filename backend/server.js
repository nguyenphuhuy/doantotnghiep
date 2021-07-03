require("dotenv").config();
var ObjectId = require('mongoose').Types.ObjectId;

const mongoose = require("mongoose");
mongoose.connect(process.env.DATABASE, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

mongoose.connection.on("error", (err) => {
  console.log("Mongoose Connection ERROR: " + err.message);
});

mongoose.connection.once("open", () => {
  console.log("MongoDB Connected!");
});

//Bring in the models
require("./models/User");
require("./models/Chatroom");
require("./models/Message");
require("./models/Friend");
require("./models/Note");
require("./models/FriendRequest");

const app = require("./app");

const server = app.listen(8000, () => {
  console.log("Server listening on port 8000");
});

const io = require("socket.io")(server);
const jwt = require("jwt-then");

const Chatroom = mongoose.model("Chatroom");
const Message = mongoose.model("Message");
const User = mongoose.model("User");
const Friend = mongoose.model("Friend");
const FriendRequest = mongoose.model("FriendRequest");
const Note = mongoose.model("Note");

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.query.token;
    const payload = await jwt.verify(token, process.env.SECRET);
    socket.userId = payload.id;
    // socket.userId = "5f123456789";
    next();
  } catch (err) {}
});

const userOnline = {};
io.on("connection", (socket) => {
  console.log("Connected: " + socket.userId);
  // console.log('a user connected');
  socket.on('login', function(data){
    // console.log('a user ' + data.userId + ' connected');
    // saving userId to object with socket ID
    userOnline[socket.id] = data.userId;
    // console.log(userOnline);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected: " + socket.userId);

    delete userOnline[socket.id];
    // console.log(userOnline);
  });

  socket.on("joinRoom", ({ chatroomId }) => {
    socket.join(chatroomId);
    console.log(socket.userId+" joined chatroom: " + chatroomId);
  });

  socket.on("leaveRoom", ({ chatroomId }) => {
    socket.leave(chatroomId);
    console.log(socket.userId+" left chatroom: " + chatroomId);
  });

  socket.on("chatroomMessage", async ({ chatroomId, message, NameUser, time, level, currentUserId }) => {
    if (message.trim().length > 0) {
      const user = await User.findOne({ _id: socket.userId });
      const newMessage = new Message({
        chatroom: chatroomId,
        user: socket.userId,
        name: NameUser,
        message,
        time:time,
        level:level
      });
      
      //kt xem la bạn chưa
      if(level == 0){
        const checkFriend = await Friend.find({$or: [{userId1: currentUserId, userId2:chatroomId}, {userId1:chatroomId, userId2:currentUserId}] });
        if(checkFriend.length == 0){
          // addfriend
          const friend = new Friend({
            userId1: currentUserId,
            userId2: chatroomId
          });
          await friend.save();

        }
        
      }
      
      

      io.to(chatroomId).emit("newMessage", {
        message,
        name: user.name,
        userId: socket.userId,
      });
      await newMessage.save();
    }
  });

  socket.on("getMessChat", async (chatroomId) => {
    // console.log("getMessChat");
    const mess = await Message.find({ chatroom:chatroomId });
    io.to(chatroomId).emit("serverSendMessChat", {mess});
  });

  socket.on("getMessPrivate", async (data) => {
    const userId = new mongoose.Types.ObjectId(data.userId);
    const currentUserId = new mongoose.Types.ObjectId(data.currentUserId);
    // console.log("userId"+ userId+"currentUserId"+currentUserId);
    const mess = await Message.find({$or: [{$and: [ {chatroom: userId}, { user:currentUserId  }] }, {$and: [ {chatroom: currentUserId}, { user:userId  }] } ] });
    // console.log("mess: "+mess);
    io.to(data.userId).emit("serverSendMessChatPrivate", {mess});
    io.to(data.currentUserId).emit("serverSendMessChatPrivate", {mess});
  });

  socket.on("clientAddFriend", async (data) => {
    if(data.userSend != "" && data.userGet){
      const friend = new FriendRequest({
        userSend: data.userSend,
        userGet: data.userGet,
        status: 0
      });
      
      await friend.save();
      
      socket.emit("resultAddFriend", {message: "Add friend successfully"});
    }
    
  });

  socket.on("clientDeleteFriend", async (data) => {
    if(data.userSend != "" && data.userGet){
      const result = await FriendRequest.deleteOne({$and: [{ userGet: data.userGet }, { userSend: data.userSend }]});
      
      if(result){
        socket.emit("resultDeleteFriend", {message: "Delete Add friend successfully"});
      }
      
    }
    
  });

  socket.on("friendRequestUserID", async (data) => {
    const result = await FriendRequest.find({userGet: data.userId});
    socket.emit("serverFriendRequestUserID", {result});
  });

  socket.on("clientAccept", async (data) => {
      await FriendRequest.deleteOne({userGet: data.userGet, userSend: data.userSend});
      const checkFriend = await FriendRequest.find({$or: [{userId1: data.userGet, userId2:data.userSend}, {userId1:data.userSend, userId2:data.userGet}] });
      const friend = new Friend({
        userId1: data.userSend,
        userId2: data.userGet
      });
  
      await friend.save();
      socket.emit("ServerAccept", {mess: "Accept friend successfully"});
  });

  socket.on("clientDelete", async (data) => {
    await FriendRequest.deleteOne({userGet: data.userGet, userSend: data.userSend});
    socket.emit("serverDelete", {mess: "Delete friend successfully"});
  });

  socket.on("callvideo", async (data) => {
    console.log("callvideo = "+ data.userCall);
    io.to(data.userCall).emit("haveCall", {userSendCall:data.currentUserId, nameUserSendCall:data.nameCurrent});
  });

  socket.on("closeModal", async (data) => {
    io.to(data.userCall).emit("serverCloseModal");
  });

  socket.on("accCallVideo", async (data) => {
    io.to(data.userCall).emit("serverAccCallVideo", {});
  });

  socket.on("readyVideoCall", async (data) => {
    io.to(data.userCall).emit("serverReadyVideoCall", {peerID:data.peerID});
  });

  socket.on("swiped", async (data) => {
    if(data.direction == "right"){
      const result = await FriendRequest.find({userSend: data.idSwipe,userGet: data.idCurrent,status:1 });
      if(result.length > 0){
        // addfriend
        const friend = new Friend({
          userId1: data.idSwipe,
          userId2: data.idCurrent
        });
    
        await friend.save();
        socket.emit("serverSwiped",{mess:"2 bạn đã được ghép đôi thành công", name:data.name});
        // io.to(data.idSwipe).emit("serverSwiped",{mess:"2 bạn đã được ghép đôi thành công", name:data.name});
        // io.to(data.idCurrent).emit("serverSwiped",{mess:"2 bạn đã được ghép đôi thành công", name:data.name});
      }else{
        // else: add friendRequest status=1,idSend=Idcurrent,idReceive=idSwipe
        const friendRequest = new FriendRequest({
          userSend: data.idCurrent,
          userGet: data.idSwipe,
          status:1
        });
    
        await friendRequest.save();
        
      }
    }else{
      // dislike
      // add friendRequest idsend=Idcurrent, idReceive=idSwipe,status=0 
      const friendRequest = new FriendRequest({
        userSend: data.idCurrent,
        userGet: data.idSwipe,
        status:0
      });
  
      await friendRequest.save();
    }
    
  });

  socket.on("userLeave", async (data) => {
    io.to(data.userCall).emit("serverUserLeave");
  });

  socket.on("UpdateUser", async (data) => {
    if(data.name){
      let result = User.update({_id:data.id}, {$set: { name: data.name }}, {upsert: true}, function(err){
        console.log(err);
      });
      if(result){
        socket.emit("serverUpdateUser", {mess: "Upadte successfully!"});
      }
    }
    // email
    if(data.email){
      let result = User.update({_id:data.id}, {$set: { email: data.email }}, {upsert: true}, function(err){
        console.log(err);
      });
      if(result){
        socket.emit("serverUpdateUser", {mess: "Upadte successfully!"});
      }
    }
    // bio
    if(data.bio){
      let result = User.update({_id:data.id}, {$set: { bio: data.bio }}, {new: true}, function(err){
        console.log(err);
      });
      if(result){
        socket.emit("serverUpdateUser", {mess: "Upadte successfully!"});
      }
    }
  });

  // get volunteer 
  socket.on("getVolunteer", async (data) => {
    const users = await User.find({level: 1});
    socket.emit("serverSendVolunteer", {users});
  });

  socket.on("getUser", async (data) => {
    const users = await User.find({level: 0});
    socket.emit("serverSendUser", {users});
  });

  // get Nameroom
  socket.on("getNameRoom", async (data) => {
    const chatroom = await Chatroom.find({_id:data.chatroomId});
    socket.emit("serverSendNameRoom", {chatroom});
  });

  // delete user 
  socket.on("deleteUser", async (data) => {
      const result = await User.deleteOne({_id:data.idDelete});
      
      if(result){
        socket.emit("resultDeleteUser", {message: "Xóa thành công!"});
      }
  });

  // change user to volunteer
  socket.on("changeUser", async (data) => {
    let result = User.update({_id:data.id}, {$set: { volun: 1, level: 1 }}, {upsert: true}, function(err){
      console.log(err);
    });
    if(result){
      socket.emit("serverUpdateChangeUser", {message: "Đổi sang Tình Nguyện Viên thành công!"});
    }
  });

  // get order user
  socket.on("getOrderVolunteer", async (data) => {
    const users = await User.find({level: 0, volun:1});
    socket.emit("serverSendOrderVolunteer", {users});
  });

  // duyet tinh nguyen vien
  socket.on("acceptVolun", async (data) => {
    let result = User.updateOne({_id:data.id}, {$set: { level: 1 }}, {upsert: true}, function(err){
      console.log(err);
    });
    if(result){
      socket.emit("serverAcceptVolun", {message: "Duyệt thành công!"});
    }
  });

  // add News
  socket.on("addNews", async (data) => {
    const result = new Note({
      title: data.title,
      content: data.content
    });
    await result.save();

    // if(result){
      socket.emit("serverAddNews", {message: "Thêm thành công!"});
    // }
  });

  // getNote 
  socket.on("getNote", async (data) => {
    const users = await Note.find({});
    socket.emit("serverSendNote", {users});
  });

  // delete note
  socket.on("deleteNote", async (data) => {
    const result = await Note.deleteOne({_id:data.idDelete});
    
    if(result){
      socket.emit("resultDeleteNote", {message: "Xóa thành công!"});
    }
  });

  // get by id note
  socket.on("getIdNote", async (data) => {
    const note = await Note.findOne({_id:data.id});
    socket.emit("serverSendIdNote", {note});
  });

  //update News
  socket.on("updateNews", async (data) => {
    let result = Note.update({_id:data.id}, {$set: { title: data.title, content:data.content }}, {upsert: true}, function(err){
      console.log(err);
    });
    if(result){
      socket.emit("serverUpdateNews", {message: "Sửa bài viết thành công!"});
    }
  });

  //delete Chatroom
  socket.on("deleteChatroom", async (data) => {
    const result = await Chatroom.deleteOne({_id:data.idDelete});
    
    if(result){
      socket.emit("resultDeleteChatroom", {message: "Xóa thành công!"});
    }
  });

  // add Group
  socket.on("addGroup", async (data) => {
    const result = new Chatroom({
      name: data.name,
    });
    await result.save();

    // if(result){
      socket.emit("serverAddGroup", {message: "Thêm thành công!"});
    // }
  });


});
