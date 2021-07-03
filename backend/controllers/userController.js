const mongoose = require("mongoose");
const User = mongoose.model("User");
const FriendRequest = mongoose.model("FriendRequest");
const Friend = mongoose.model("Friend");
const sha256 = require("js-sha256");
const jwt = require("jwt-then");

exports.register = async (req, res) => {

  const { name, email, password,detail,volun } = req.body;
  if (res.locals.nameImage) {
    var img = res.locals.nameImage;
  }
  
  // detail
  // if(!detail){
  //   detail = "";
  // }

  const emailRegex = /@gmail.com|@yahoo.com|@hotmail.com|@live.com/;

  if (!emailRegex.test(email)) throw "Email is not supported from your domain.";
  if (password.length < 6) throw "Password must be atleast 6 characters long.";

  const userExists = await User.findOne({
    email,
  });

  if (userExists) throw "User with same email already exits.";

  const user = new User({
    name,
    email,
    password: sha256(password + process.env.SALT),
    img,
    detail,
    volun,
    level:0
  });

  await user.save();

  res.json({
    message: "User " + name + " registered successfully!",
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({
    email,
    password: sha256(password + process.env.SALT),
  });
  
  if (!user) throw "Email and Password did not match.";
  // const level = 0;
  const token = await jwt.sign({ id: user.id }, process.env.SECRET);
  // if(user.level){
  //   level = user.level;
  // }

  res.json({
    message: "User logged in successfully!",
    name: user.name,
    userId: user._id,
    level:user.level,
    token,
  });
};

exports.getAll = async(req, res) => {
  const users = await User.find({});

  if(!users) throw "Error when get User";

  res.json({
    message: "Get User Successfully",
    data: users
  });
}

exports.getPerUser = async (req, res) => {
  const userId = req.params.id;
  const users = await User.find({_id: new mongoose.Types.ObjectId(userId) });

  if(!users) throw "Error when get User";

  res.json({
    message: "Get User Successfully",
    data: users
  })
}

exports.UserFriendRq = async (req, res) => {
  const id = req.params.id;
  const friendRQ = await FriendRequest.find({userSend: id});
  let ListUserGet = [];
  
  let ListFriend = [];
  
  let user = await User.find({});

  // filter như vòng foreach có điều kiện
  // ListUserGet.includes(value._id) sẽ trả về true nếu trong mảng có giá trị đó
  await friendRQ.forEach(Element => {
    ListUserGet.push(Element.userGet.toString());
  });
  // console.log(ListUserGet.includes('5f7e83a70cba240ce43acf62'));
  let UserFilterGet = [];
  // dùng splice gây ra lỗi rất nhiều => nên tạo mảng mới rôi push vào
  await user.forEach((element,index) => {
    if(!ListUserGet.includes(element._id.toString())){
      // user.splice(index,1);
      UserFilterGet.push(element);
    }
   
  });
  const friended = await Friend.find({$or:[{userId1:id}, {userId2:id}] });
  
  friended.forEach(Element => {
  if(Element.userId1 == id){
      ListFriend.push(Element.userId2.toString())
  }else{
      ListFriend.push(Element.userId1.toString())
  }
  });
  let arrResult = [];
  UserFilterGet.forEach((element,index) => {
  if(!ListFriend.includes(element._id.toString())){
      // characters.splice(index,1);
      arrResult.push(element);
  }
  });
  
  arrResult.forEach((element,index) => {
  if(element._id == id){
      arrResult.splice(index,1);
  }
  });
  
  res.json(arrResult);
}

exports.update = async (req, res) => {
  if (res.locals.nameImage) {
    var img = res.locals.nameImage;
  }
  const id = req.params.id;
  const result = User.update({_id:id}, {$set: { img: img }}, {upsert: true}, function(err){
    console.log(err);
  });

  if(result){
    res.json({
      message: "Update User Successfully",
    });
  }  
}