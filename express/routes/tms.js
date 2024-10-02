var express = require("express");
var router = express.Router();
const auth = require("../controllers/auth");

const appC = require("../controllers/app");
const planC = require("../controllers/plan");
const taskC = require("../controllers/task");

// Application
router.get("/apps/all", auth.verifyToken, appC.getAllApp);
router.post(
	"/apps/create",
	auth.verifyToken,
	auth.authorizedForRoles("PL"),
	appC.createApp
);
router.post(
	"/apps/getOne",
	auth.verifyToken,
	auth.authorizedForRoles("PL"),
	appC.getApp
);
router.put(
	"/apps/update",
	auth.verifyToken,
	auth.authorizedForRoles("PL"),
	appC.updateApp
);

//Plans
router.post("/plans/all", auth.verifyToken, planC.getAllPlan);
router.post("/plans/getOne", auth.verifyToken, planC.getPlan);
router.post(
	"/plans/create",
	auth.verifyToken,
	auth.authorizedForRoles("PM"),
	planC.createPlan
);
router.put(
	"/plans/update",
	auth.verifyToken,
	auth.authorizedForRoles("PM"),
	planC.updatePlan
);

//Tasks
router.post("/tasks/all", auth.verifyToken, taskC.getAllTask);
router.post("/tasks/getOne", auth.verifyToken, taskC.getTask);

//Task require further auth checks for write access
router.post(
	"/tasks/create",
	auth.verifyToken,
	auth.authorisedForTasks,
	taskC.createTask
);
router.put(
	"/tasks/plan",
	auth.verifyToken,
	auth.authorisedForTasks,
	taskC.updateTaskPlan
);
router.put(
	"/tasks/notes",
	auth.verifyToken,
	auth.authorisedForTasks,
	taskC.updateTaskNotes
);
router.put(
	"/tasks/promoteTask2Todo",
	auth.verifyToken,
	auth.authorisedForTasks,
	taskC.promoteTask2Todo
);
router.put(
	"/tasks/promoteTask2Doing",
	auth.verifyToken,
	auth.authorisedForTasks,
	taskC.promoteTask2Doing
);
router.put(
	"/tasks/promoteTask2Done",
	auth.verifyToken,
	auth.authorisedForTasks,
	taskC.promoteTask2Done
);
router.put(
	"/tasks/promoteTask2Close",
	auth.verifyToken,
	auth.authorisedForTasks,
	taskC.promoteTask2Close
);
router.put(
	"/tasks/demoteTask2Doing",
	auth.verifyToken,
	auth.authorisedForTasks,
	taskC.demoteTask2Doing
);
router.put(
	"/tasks/demoteTask2Todo",
	auth.verifyToken,
	auth.authorisedForTasks,
	taskC.demoteTask2Todo
);

module.exports = router;
