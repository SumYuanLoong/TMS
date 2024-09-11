var express = require("express");
var router = express.Router();
const authC = require("../controllers/auth");
const groupC = require("../controllers/group");

router.get("/getAll", authC.checkGroup, groupC.getallGroup);
router.post("/", authC.checkGroup, groupC.createGroup);
router.put("/", authC.checkGroup, groupC.manageGroup);

module.exports = router;
