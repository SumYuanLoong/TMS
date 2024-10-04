var express = require("express");
var router = express.Router();
const createTask = require("../controller/createTask");
const taskByState = require("../controller/GetTaskByState");
const promoteTask2Done = require("../controller/promoteTask2Done");

router.post("/createTask", createTask);
router.post("/taskByState", taskByState);
router.post("/promoteTask2Done", promoteTask2Done);

module.exports = router;
