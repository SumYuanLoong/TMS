var express = require("express");
var router = express.Router();
const auth = require("../middlewares/authentication");
const groupC = require("../controllers/group");

router.get(
	"/getAll",
	auth.authorizeRoles("admin"),
	auth.verifyToken,
	groupC.getallGroup
);
router.post(
	"/",
	auth.authorizeRoles("admin"),
	auth.verifyToken,
	groupC.createGroup
);
router.put(
	"/",
	auth.authorizeRoles("admin"),
	auth.verifyToken,
	groupC.manageGroup
);

module.exports = router;
