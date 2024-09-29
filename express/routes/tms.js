var express = require("express");
var router = express.Router();
const auth = require("../controllers/auth");

const appC = require("../controllers/app");
const planC = require("../controllers/plan");
const taskC = require("../controllers/task");

// Application
router.get("/apps/all", auth.verifyToken, appC.getAllApp);
router.post("/apps/create", auth.verifyToken, appC.createApp);
router.post("/apps/getOne", auth.verifyToken, appC.getApp);
router.put("/apps/update", auth.verifyToken, appC.updateApp);

//Plans
router.post("/plans/all", auth.verifyToken, planC.getAllPlan);
router.post("/plans/create", auth.verifyToken, planC.createPlan);

//Tasks
router.post("/tasks/all", auth.verifyToken, taskC.getAllTask);
router.post("/tasks/getOne", auth.verifyToken, taskC.getTask);
router.post("/tasks/create", auth.verifyToken, taskC.createTask);

router.post("/", appC.getApp);

module.exports = router;
