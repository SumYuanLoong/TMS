var express = require("express");
var router = express.Router();
const authC = require("../controllers/auth");
const groupC = require("../controllers/group");

router.get("/getAll", authC.verifyToken, groupC.getallGroup);
router.post("/", authC.verifyToken, groupC.createGroup);
router.put("/", authC.verifyToken, groupC.manageGroup);

module.exports = router;
