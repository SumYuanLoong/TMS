/**
 * Task Controller
 */

const pool = require("../utils/db");
var ErrorObj = require("../utils/errorMessage");
var jwt = require("jsonwebtoken");
let mailer = require("../utils/mailer");

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
			let [val1] = await pool.execute(
				"select t.task_id, t.task_name, t.task_description, t.task_owner, t.task_state, p.plan_colour as 'color' " +
					"from task t left join plan p on t.task_plan = p.plan_mvp_name and t.task_app_acronym = p.plan_app_acronym " +
					"where t.task_app_acronym = ?",
				[app_name]
			);

			res.status(200).json({
				success: true,
				taskList: val1
			});
		} catch (error) {
			return next(new ErrorObj("die", 500, ""));
		}
	}
};

/**
 * Get 1 task
 */
exports.getTask = async (req, res, next) => {
	const { task_id } = req.body;

	try {
		let [val] = await pool.execute("select * from task where task_id = ?", [
			task_id
		]);
		if (val.length == 0) {
			return res.status(404).json({
				success: false,
				message: "Task with this task_id not found"
			});
		} else {
			res.status(200).json({
				success: true,
				task: val[0]
			});
		}
	} catch (error) {
		return res.status(404).json({
			success: false,
			message: "Error when finding this task"
		});
	}
};

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
	let {
		task_name,
		task_description,
		app_acronym,
		plan_name,
		input_task_notes
	} = req.body;

	const createDate = Date.now();
	let token = req.cookies.token;
	let decoded = await jwt.verify(token, process.env.JWT_secret);
	let username = decoded.username;

	// TODO: create date
	if (!task_name || !app_acronym) {
		return res.status(401).json({
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
				new ErrorObj("app_acronym does not exist in system", 400, "")
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
		try {
			let [val] = await pool.execute(
				`select exists(select 1 from plan where Plan_app_Acronym = ? and Plan_MVP_name = ?) as plan_exists`,
				[app_acronym, plan_name]
			);
			if (!val[0].plan_exists) {
				return res.status(500).json({
					success: false,
					message: "This Plan does not exist"
				});
			}
		} catch (error) {
			return res.status(500).json({
				success: false,
				message: "Database Error"
			});
		}
	}

	let task_notes = `${username} has created task ${task_name} at ${formattedDate}. \n Task is now open. \n`;
	task_notes = task_notes + input_task_notes;

	pool.query("START transaction");

	try {
		//get app_Rnumber
		let [val1] = await pool.execute(
			"select app_rnumber from application where app_acronym = ?",
			[app_acronym]
		);

		//increment it
		let Rnum = val1[0].app_rnumber + 1;

		const task_id = app_acronym + "_" + Rnum;

		let [val2] = await pool.execute(
			"insert into task " +
				"(task_id, task_name, task_description, task_state, task_creator, task_owner, task_createDate, " +
				"task_notes, task_plan, task_app_acronym) " +
				"values (?,?,?,?,?,?,?,?,?,?)",
			[
				task_id,
				task_name,
				task_description,
				"Open",
				username,
				username,
				formattedDate,
				task_notes || null,
				plan_name || null,
				app_acronym
			]
		);

		let [val3] = await pool.execute(
			"Update application set app_Rnumber = ? where app_acronym = ?",
			[Rnum, app_acronym]
		);
		await pool.query("COMMIT");

		res.status(200).json({
			success: true
		});
	} catch (error) {
		console.log(error);
		pool.query("ROLLBACK");
		res.status(400).json({
			success: false,
			message: "Something wrong in transaction"
		});
	}
};

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
 * sample usage: sendEmail(username, task_name, username, app_acronym);
 * @param {*} user task creator
 * @param {*} task_name
 * @param {*} promotor user that promoted it
 * @param {*} app_acronym
 */
async function sendEmail(user, task_name, promotor, app_acronym) {
	const info = mailer.sendMail({
		from: '"TMS" <no-reply.TMS@ethereal.email>', // sender address
		to: `${user}@ethereal.email`, // list of receivers
		subject: `${task_name} is done`, // Subject line
		text: `${task_name} for ${app_acronym} has been promoted to the done state by ${promotor}` // plain text body
		//html: "<b>Hello world?</b>" // html body
	});
}
