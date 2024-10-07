var express = require("express");
var router = express.Router();
const c1 = require("../controller/createTask");
const c2 = require("../controller/GetTaskByState");
const c3 = require("../controller/promoteTask2Done");

router.post("/getTaskByState", c2.getTasksByState);
router.patch(`/promoteTask2Done`, c3.promoteTask2Done);
router.post("/createTask", c1.createTask);

module.exports = router;
