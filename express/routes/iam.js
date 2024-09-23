var express = require("express");
var router = express.Router();
const authC = require("../controllers/auth");
const userC = require("../controllers/users");
const groupC = require("../controllers/group");
const auth = require("../middlewares/authentication");

/**
 * Routes for Identity access management
 */

// routes to manage cookie state
router.post("/auth/login", authC.login);
router.post("/auth/logout", authC.logout);
router.get("/auth", auth.verifyToken, authC.who);

// routes related to groups
router.get(
	"/groups/getAll",
	auth.verifyToken,
	auth.authorizedForRoles("admin"),
	groupC.getallGroup
);
router.post(
	"/groups/",
	auth.verifyToken,
	auth.authorizedForRoles("admin"),
	groupC.createGroup
);
router.put(
	"/groups/",
	auth.verifyToken,
	auth.authorizedForRoles("admin"),
	groupC.manageGroup
);

/* user routes. */
router.get(
	"/users/getall",
	auth.verifyToken,
	auth.authorizedForRoles("admin"),
	userC.getAllUser
);
router.get("/users/getOneUser", auth.verifyToken, userC.getOneUser);
router.post(
	"/users/createUser",
	auth.verifyToken,
	auth.authorizedForRoles("admin"),
	userC.createUser
);
router.patch("/users/updateEmail", auth.verifyToken, userC.updateEmail);
router.patch("/users/updatePassword", auth.verifyToken, userC.updatePassword);
router.patch(
	"/users/updateActive",
	auth.verifyToken,
	auth.authorizedForRoles("admin"),
	userC.userActive
);

module.exports = router;
