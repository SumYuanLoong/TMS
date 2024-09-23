var express = require("express");
var router = express.Router();
const userC = require("../controllers/users");
const auth = require("../middlewares/authentication");

/* GET users listing. */
router.get(
	"/getall",
	auth.verifyToken,
	auth.authorizeRoles("admin"),
	userC.getAllUser
);
router.get("/getOneUser", auth.verifyToken, userC.getOneUser);
router.post(
	"/createUser",
	auth.verifyToken,
	auth.authorizeRoles("admin"),
	userC.createUser
);
router.patch("/updateEmail", auth.verifyToken, userC.updateEmail);
router.patch("/updatePassword", auth.verifyToken, userC.updatePassword);
router.patch(
	"/updateActive",
	auth.verifyToken,
	auth.authorizeRoles("admin"),
	userC.userActive
);

module.exports = router;
