/**
 * Task Controller
 */

const pool = require("../utils/db");
var ErrorObj = require("../utils/errorMessage");

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
				"select task_name, task_description, task_owner from task where task_app_acronym = ?",
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
 * need check for same name within 1 app
 * TODO: transaction
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.createTask = async (req, res, next) => {
	//something or the others
	let { task_id, task_name, task_description } = req.body;

	const createDate = Date.now();
	let token = req.cookies.token;
	let decoded = await jwt.verify(token, process.env.JWT_secret);
	let username = decoded.username;

	pool.query("start transaction");

	//get app_Rnumber
	//increment it
	//
	try {
		let [val] = await pool.execute(
			"insert into `task` (`task_id`, `task_name`, `task_description`, `task_state`, `task_creator`, `task_owner`, `task_createDate` ) values (?,?,?,?,?)",
			[
				task_id,
				task_name,
				task_description,
				"Open",
				username,
				username,
				createDate
			]
		);

		let [val2] = await pool.execute(
			"Update app_Rnumber from app where app_acronym = ?",
			[Rnum, app_name]
		);
		pool.query("commit");
		res.status.json({
			success: true
		});
	} catch (error) {
		return next("error with insertion");
	}
};
