const router = require("express").Router();
const { catchErrors } = require("../handlers/errorHandlers");
const noteController = require("../controllers/noteController");

const auth = require("../middlewares/auth");

router.get("/", catchErrors(noteController.getAll));

module.exports = router;