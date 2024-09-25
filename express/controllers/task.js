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
	console.log(app_name);
	if (app_name) {
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
			return next(new ErrorObj("die", 500, ""));
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
	let { task_name, task_description, app_acronym, plan_name, task_notes } =
		req.body;

	const createDate = Date.now();
	let token = req.cookies.token;
	let decoded = await jwt.verify(token, process.env.JWT_secret);
	let username = decoded.username;
	// TODO: create date
	if (!task_name || !app_acronym) {
		res.status(401).json({
			success: false,
			message: "Required fields are missing"
		});
	}
	try {
		let [val] = await pool.execute(
			`select exists(select 1 from application where app_acronym = ?) as app_exists`,
			[app_acronym]
		);
		if (!val[0].app_exists) {
			return next(
				new ErrorObj("app_acronym does not exist system", 400, "")
			);
		}
	} catch (err) {
		return next(new ErrorObj("Database error", 500, ""));
	}

	//auto generate date
	const today = new Date();
	const dd = String(today.getDate()).padStart(2, "0");
	const mm = String(today.getMonth() + 1).padStart(2, "0");
	const yyyy = today.getFullYear();
	const formattedDate = `${dd}-${mm}-${yyyy}`;

	//TODO: Plan validation, plan must exist in the app provided, but plan can be null
	if (plan_name) {
		//do validation
	}

	pool.query("BEGIN transaction");

	try {
		//get app_Rnumber
		let [val1] = await pool.execute(
			"select app_rnumber from application where app_acronym = ?",
			[app_acronym]
		);

		//increment it
		let Rnum = val1[0].app_rnumber + 1;

		const task_id = app_acronym + Rnum;

		let [val2] = await pool.execute(
			"insert into `task` " +
				"(`task_id`, `task_name`, `task_description`, `task_state`, `task_creator`, `task_owner`, `task_createDate` " +
				"`task_notes`, `task_plan`, `task_app_acronym`, ) " +
				"values (?,?,?,?,?)",
			[
				task_id,
				task_name,
				task_description,
				"Open",
				username,
				username,
				formattedDate,
				task_notes,
				plan_name,
				app_acronym
			]
		);

		let [val3] = await pool.execute(
			"Update app_Rnumber from app where app_acronym = ?",
			[Rnum, app_acronym]
		);
		pool.query("COMMIT transaction");
		res.status.json({
			success: true
		});
	} catch (error) {
		pool.query("ROLLBACK transaction");
		return next("error with insertion");
	}
};
