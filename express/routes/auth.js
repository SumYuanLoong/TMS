var express = require("express");
var router = express.Router();
const authC = require("../controllers/auth");

/* GET users listing. */
router.post("/login", authC.login);

module.exports = router;
