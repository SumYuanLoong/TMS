var express = require("express");
var router = express.Router();
const userC = require("../controllers/users");
const authC = require("../controllers/auth");

/* GET users listing. */
router.get("/getall", authC.checkGroup, userC.getAllUser);

router.post("/createUser", authC.checkGroup, userC.createUser);

module.exports = router;
