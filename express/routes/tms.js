var express = require("express");
var router = express.Router();
const auth = require("../middlewares/authentication");

const appC = require("../controllers/app");
const planC = require("../controllers/plan");
const taskC = require("../controllers/task");

// Application
router.get("/apps/all", auth.verifyToken, appC.getAllApp);
router.post("/apps/create", auth.verifyToken, appC.createApp);

//Plans
router.get("/plans/all", auth.verifyToken, planC.getAllPlan);
router.post("/plans/create", auth.verifyToken, planC.createPlan);

//Tasks
router.get("/tasks/all", auth.verifyToken, taskC.getAllTask);
router.post("/tasks/create", auth.verifyToken, taskC.createTask);

module.exports = router;
