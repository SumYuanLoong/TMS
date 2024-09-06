var express = require('express');
var router = express.Router();
const userC = require("../controllers/users")

/* GET users listing. */
router.get('/getall', userC.getAllUser);

module.exports = router;
