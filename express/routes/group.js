var express = require("express");
var router = express.Router();
const auth = require("../middlewares/authentication");
const groupC = require("../controllers/group");

router.get("/getAll", auth.verifyToken, groupC.getallGroup);
router.post("/", auth.verifyToken, groupC.createGroup);
router.put("/", auth.verifyToken, groupC.manageGroup);

module.exports = router;
