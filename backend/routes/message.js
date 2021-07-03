const router = require("express").Router();
const { catchErrors } = require("../handlers/errorHandlers");
const messageController = require("../controllers/messageController");
const auth = require("../middlewares/auth");

router.get("/test", catchErrors(messageController.insertTest));

module.exports = router;
