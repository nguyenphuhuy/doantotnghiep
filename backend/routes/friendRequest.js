const router = require("express").Router();
const { catchErrors } = require("../handlers/errorHandlers");
const friendRequestController = require("../controllers/friendRequestController");

const auth = require("../middlewares/auth");

router.get("/:id", auth, catchErrors(friendRequestController.getAll));
router.get("/list/:id", auth, catchErrors(friendRequestController.getList));

module.exports = router;