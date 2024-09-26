var express = require("express");
var router = express.Router();
const authC = require("../controllers/auth");
const userC = require("../controllers/users");
const groupC = require("../controllers/group");

/**
 * Routes for Identity access management
 */

// routes to manage cookie state
router.post("/auth/login", authC.login);
router.post("/auth/logout", authC.logout);
router.get("/auth", authC.verifyToken, authC.who);

// routes related to groups
router.get(
	"/groups/getAll",
	authC.verifyToken,
	authC.authorizedForRoles("admin", "PL"),
	groupC.getallGroup
);
router.post(
	"/groups/",
	authC.verifyToken,
	authC.authorizedForRoles("admin"),
	groupC.createGroup
);
router.put(
	"/groups/",
	authC.verifyToken,
	authC.authorizedForRoles("admin"),
	groupC.manageGroup
);

/* user routes. */
router.get(
	"/users/getall",
	authC.verifyToken,
	authC.authorizedForRoles("admin"),
	userC.getAllUser
);
router.get("/users/getOneUser", authC.verifyToken, userC.getOneUser);
router.post(
	"/users/createUser",
	authC.verifyToken,
	authC.authorizedForRoles("admin"),
	userC.createUser
);
router.patch("/users/updateEmail", authC.verifyToken, userC.updateEmail);
router.patch("/users/updatePassword", authC.verifyToken, userC.updatePassword);
router.patch(
	"/users/updateActive",
	authC.verifyToken,
	authC.authorizedForRoles("admin"),
	userC.userActive
);

module.exports = router;
