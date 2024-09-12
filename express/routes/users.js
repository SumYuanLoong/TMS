var express = require("express");
var router = express.Router();
const userC = require("../controllers/users");
const authC = require("../controllers/auth");

/* GET users listing. */
router.get("/getall", authC.verifyToken, userC.getAllUser);
router.get("/getOneUser", authC.verifyToken, userC.getOneUser);
router.post("/createUser", authC.verifyToken, userC.createUser);
router.patch("/updateEmail", authC.verifyToken, userC.updateEmail);
router.patch("/updatePassword", authC.verifyToken, userC.updateEmail);
router.delete("/", authC.verifyToken, userC.killUser);

module.exports = router;
