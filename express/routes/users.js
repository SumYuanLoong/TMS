var express = require("express");
var router = express.Router();
const userC = require("../controllers/users");
const auth = require("../middlewares/authentication");

/* GET users listing. */
router.get("/getall", userC.getAllUser);
router.get("/getOneUser", auth.verifyToken, userC.getOneUser);
router.post("/createUser", auth.verifyToken, userC.createUser);
router.patch("/updateEmail", auth.verifyToken, userC.updateEmail);
router.patch("/updatePassword", auth.verifyToken, userC.updateEmail);
router.delete("/", auth.verifyToken, userC.killUser);

module.exports = router;
