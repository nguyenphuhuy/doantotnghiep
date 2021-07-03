const router = require("express").Router();
const { catchErrors } = require("../handlers/errorHandlers");
const friendController = require("../controllers/friendController");
const auth = require("../middlewares/auth");

router.get("/", auth, catchErrors(friendController.getAll));
router.get("/:id", auth, catchErrors(friendController.getFrUser));

module.exports = router;
