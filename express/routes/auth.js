var express = require("express");
var router = express.Router();
const authC = require("../controllers/auth");
const auth = require("../middlewares/authentication");

/* GET users listing. */
router.post("/login", authC.login);
router.post("/logout", authC.logout);
router.get("/", auth.verifyToken, authC.who);

module.exports = router;
