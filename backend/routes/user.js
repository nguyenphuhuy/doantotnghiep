const router = require("express").Router();
const { catchErrors } = require("../handlers/errorHandlers");
const userController = require("../controllers/userController");
const { route } = require("./chatroom");

// upload Image
const multer = require("multer");
const express = require('express');
const app = express();
const path = require('path');

app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
let nameImage;
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log(file);
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        nameImage = Date.now() + path.extname(file.originalname);
        cb(null, nameImage);
    }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png' || file.mimetype == 'image/jpg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}
const upload = multer({ storage: storage, fileFilter});

router.post("/login", catchErrors(userController.login));
router.post("/register", upload.single("file"), (req, res, next) => {
    res.locals.nameImage = nameImage;
    next();
}, catchErrors(userController.register));

router.post("/update/:id", upload.single("file"), (req, res, next) => {
    res.locals.nameImage = nameImage;
    next();
}, catchErrors(userController.update));

router.get("/", catchErrors(userController.getAll));
router.get("/:id", catchErrors(userController.getPerUser));
router.get("/userFRQ/:id", catchErrors(userController.UserFriendRq));

module.exports = router;
