/**
 * Task Controller
 */

const pool = require("../utils/db");
var ErrorObj = require("../utils/errorMessage");
const groupC = require("./group");

/**
 * Gets all tasks of the Specific app
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.getAllTask = async (req, res, next) => {
	const { app_name } = req.body;
	if (!app_name) {
		try {
			let [vals] = await pool.query(
				"select task_name, task_description from task where task_app_acronym = ?",
				[app_name]
			);
			res.status(200).json({
				success: true,
				taskList: vals
			});
		} catch (error) {
			return next(new ErrorObj("die", 230, ""));
		}
	}
};

/**
 * Get 1 task
 */
exports.getTask = async (req, res, next) => {};

/**
 * Updates 1 task
 * Pre-req: User has group-level access to manage task
 * @param {string} task_id
 * @param {*} res
 * @param {*} next
 */
exports.updateTask = async (req, res, next) => {};

// What to do for change state

/**
 * Create task
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.createTask = async (req, res, next) => {};
