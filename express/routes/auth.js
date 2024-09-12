var express = require("express");
var router = express.Router();
const authC = require("../controllers/auth");

/* GET users listing. */
router.post("/login", authC.login);
router.post("/logout", authC.logout);

module.exports = router;
