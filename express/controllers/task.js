/**
 * Task Controller
 */

const pool = require("../utils/db");
var ErrorObj = require("../utils/errorMessage");
var jwt = require("jsonwebtoken");
let mailer = require("../utils/mailer");

const actions = {
	promote: "promote",
	demote: "demote"
};

/**
 * Gets all task of the Specific app
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

	let token = req.cookies.token;
	let decoded = await jwt.verify(token, process.env.JWT_secret);
	let username = decoded.username;

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
		} else {
			//app exists
			let [taskCheck] = await pool.execute(
				`select exists(select 1 from task where Task_app_Acronym = ? and Task_name = ?) as task_exists`,
				[app_acronym, task_name]
			);
			if (taskCheck[0].task_exists) {
				return res.status(401).json({
					success: false,
					message: "Task with same name already exists in app"
				});
			}
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

	const hours = today.getHours().toString().padStart(2, "0");
	const minutes = today.getMinutes().toString().padStart(2, "0");
	const formattedDatetime = `${dd}-${mm}-${yyyy}, ${hours}:${minutes}`;

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

	let task_notes = `${username} has created task ${task_name} at ${formattedDatetime}. \n Task is now open. \n`;
	if (input_task_notes) {
		task_notes = task_notes + "Created with notes: " + input_task_notes;
	}

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
 * Updates Plan of 1 task
 * Pre-req: User has group-level access to manage task
 * @param {string} task_id
 * @param {*} res
 * @param {*} next
 */
exports.updateTaskPlan = async (req, res, next) => {
	let { task_id, plan_name } = req.body;
	let token = req.cookies.token;
	let decoded = await jwt.verify(token, process.env.JWT_secret);
	let username = decoded.username;

	//TODO: Plan validation, plan must exist in the app provided, but plan can be null

	//do validation
	try {
		let [val] = await pool.execute(
			`select exists(select 1 from plan where Plan_app_Acronym = ? and Plan_MVP_name = ?) as plan_exists`,
			[app_acronym, plan_name]
		);
		if (!val[0].plan_exists) {
			return res.status(404).json({
				success: false,
				message: "Provided Plan does not exist"
			});
		}
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Database Error task not updated"
		});
	}

	try {
		let [val] = await pool.execute(
			`update task set task_plan = ?, task_owner = ? where task_id = ?`,
			[plan_name, username, task_id]
		);
		res.status(200).json({
			success: true
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Database Error task not updated"
		});
	}
};

/**
 * Updates Plan of 1 task
 * Pre-req: User has group-level access to manage task
 * @param {string} task_id
 * @param {*} res
 * @param {*} next
 */
exports.updateTaskNotes = async (req, res, next) => {
	let { task_id, new_notes } = req.body;
	let token = req.cookies.token;
	let decoded = await jwt.verify(token, process.env.JWT_secret);
	let username = decoded.username;

	let pass = await updateTaskNotes(
		username,
		null,
		null,
		getDatetime(),
		null,
		new_notes,
		task_id
	);

	if (pass) {
		res.status(200).json({
			success: true
		});
	} else {
		res.status(500).json({
			success: false
		});
	}
};

exports.promoteTask2Todo = async (req, res, next) => {
	let { task_id, current_state } = req.body;

	let token = req.cookies.token;
	let decoded = await jwt.verify(token, process.env.JWT_secret);
	let username = decoded.username;

	try {
		let [check] = await pool.execute(
			`select case when task_state = 1 then true else false end as task_is_open
			from task where task_id = ?`,
			[task_id]
		);
		if (!check[0].task_is_open) {
			return res.status(400).json({
				success: false,
				message:
					"Task is not in open state and cannot be promoted to Todo"
			});
		}

		let [val] = await pool.execute(
			`update task set task_state = 2, task_owner = ? where task_id = ?`,
			[username, task_id]
		);
		if (val.affectedRows === 0) {
			return res.status(500).json({
				success: false,
				message: "Task is not updated"
			});
		} else {
			if (
				await updateTaskNotes(
					username,
					"Todo",
					null,
					getDatetime(),
					actions.promote,
					null,
					task_id
				)
			) {
				res.status(200).json({
					success: true
				});
			}
		}
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Database Error task not updated"
		});
	}
};

exports.promoteTask2Doing = async (req, res, next) => {
	let { task_id, current_state } = req.body;

	let token = req.cookies.token;
	let decoded = await jwt.verify(token, process.env.JWT_secret);
	let username = decoded.username;

	try {
		let [check] = await pool.execute(
			`select case when task_state = 2 then true else false end as task_is_Todo
			from task where task_id = ?`,
			[task_id]
		);
		if (!check[0].task_is_Todo) {
			return res.status(400).json({
				success: false,
				message:
					"Task is not in Todo state and cannot be promoted to Doing"
			});
		}

		let [val] = await pool.execute(
			`update task set task_state = 3, task_owner = ? where task_id = ?`,
			[username, task_id]
		);
		if (val.affectedRows === 0) {
			return res.status(500).json({
				success: false,
				message: "Task is not updated"
			});
		} else {
			if (
				await updateTaskNotes(
					username,
					"Doing",
					null,
					getDatetime(),
					actions.promote,
					null,
					task_id
				)
			) {
				res.status(200).json({
					success: true
				});
			}
		}
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			success: false,
			message: "Database Error task not updated"
		});
	}
};

exports.promoteTask2Done = async (req, res, next) => {
	let { task_id, current_state } = req.body;

	let token = req.cookies.token;
	let decoded = await jwt.verify(token, process.env.JWT_secret);
	let username = decoded.username;

	let email, task_name, task_app_acronym;
	try {
		let [check] = await pool.execute(
			`select case when task_state = 3 then true else false end as task_is_doing
			from task where task_id = ?`,
			[task_id]
		);
		if (!check[0].task_is_doing) {
			return res.status(400).json({
				success: false,
				message:
					"Task is not in doing state and cannot be promoted to Done"
			});
		}

		let [val] = await pool.execute(
			`update task set task_state = 4, task_owner = ? where task_id = ?`,
			[username, task_id]
		);
		if (val.affectedRows === 0) {
			return res.status(500).json({
				success: false,
				message: "Task is not updated"
			});
		} else {
			if (
				await updateTaskNotes(
					username,
					"Done",
					null,
					getDatetime(),
					actions.promote,
					null,
					task_id
				)
			) {
				//need task_creator, email address, task_name,
				let [vals] = await pool.execute(
					`select u.email, t.task_name, t.task_app_acronym from task t 
				join users u on t.Task_creator = u.user_name where task_id = ?`,
					[task_id]
				);
				if (vals[0]) {
					email = vals[0].email;
					task_name = vals[0].task_name;
					task_app_acronym = vals[0].task_app_acronym;
				}

				await sendEmail(email, task_name, username, task_app_acronym);
				res.status(200).json({
					success: true
				});
			}
		}
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			success: false,
			message: "Database Error task not updated"
		});
	}
};

exports.promoteTask2Close = async (req, res, next) => {
	let { task_id, current_state } = req.body;

	let token = req.cookies.token;
	let decoded = await jwt.verify(token, process.env.JWT_secret);
	let username = decoded.username;

	try {
		let [check] = await pool.execute(
			`select case when task_state = 4 then true else false end as task_is_done
			from task where task_id = ?`,
			[task_id]
		);
		if (!check[0].task_is_done) {
			return res.status(400).json({
				success: false,
				message:
					"Task is not in done state and cannot be promoted to close"
			});
		}

		let [val] = await pool.execute(
			`update task set task_state = 5, task_owner = ? where task_id = ?`,
			[username, task_id]
		);
		if (val.affectedRows === 0) {
			return res.status(500).json({
				success: false,
				message: "Task is not updated"
			});
		} else {
			if (
				await updateTaskNotes(
					username,
					"Closed",
					null,
					getDatetime(),
					actions.promote,
					null,
					task_id
				)
			) {
				res.status(200).json({
					success: true
				});
			}
		}
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			success: false,
			message: "Database Error task not updated"
		});
	}
};

exports.demoteTask2Doing = async (req, res, next) => {
	let { task_id, current_state } = req.body;

	let token = req.cookies.token;
	let decoded = await jwt.verify(token, process.env.JWT_secret);
	let username = decoded.username;

	try {
		let [check] = await pool.execute(
			`select case when task_state = 4 then true else false end as task_is_done
			from task where task_id = ?`,
			[task_id]
		);
		if (!check[0].task_is_done) {
			return res.status(400).json({
				success: false,
				message:
					"Task is not in done state and cannot be demoted to doing"
			});
		}

		let [val] = await pool.execute(
			`update task set task_state = 3, task_owner = ? where task_id = ?`,
			[username, task_id]
		);
		if (val.affectedRows === 0) {
			return res.status(500).json({
				success: false,
				message: "Task is not updated"
			});
		} else {
			if (
				await updateTaskNotes(
					username,
					"Doing",
					null,
					getDatetime(),
					actions.demote,
					null,
					task_id
				)
			) {
				res.status(200).json({
					success: true
				});
			}
		}
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Database Error task not updated"
		});
	}
};

exports.demoteTask2Todo = async (req, res, next) => {
	let { task_id, current_state } = req.body;

	let token = req.cookies.token;
	let decoded = await jwt.verify(token, process.env.JWT_secret);
	let username = decoded.username;

	try {
		let [check] = await pool.execute(
			`select case when task_state = 3 then true else false end as task_is_doing
			from task where task_id = ?`,
			[task_id]
		);
		if (!check[0].task_is_doing) {
			return res.status(400).json({
				success: false,
				message:
					"Task is not in doing state and cannot be demoted to Todo"
			});
		}

		let [val] = await pool.execute(
			`update task set task_state = 2, task_owner = ? where task_id = ?`,
			[username, task_id]
		);
		if (val.affectedRows === 0) {
			return res.status(500).json({
				success: false,
				message: "Task is not updated"
			});
		} else {
			if (
				await updateTaskNotes(
					username,
					"Todo",
					null,
					getDatetime(),
					actions.demote,
					null,
					task_id
				)
			) {
				res.status(200).json({
					success: true
				});
			}
		}
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Database Error task not updated"
		});
	}
};

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

function getDatetime() {
	const today = new Date();
	const dd = String(today.getDate()).padStart(2, "0");
	const mm = String(today.getMonth() + 1).padStart(2, "0");
	const yyyy = today.getFullYear();
	const hours = today.getHours().toString().padStart(2, "0");
	const minutes = today.getMinutes().toString().padStart(2, "0");
	return `${dd}-${mm}-${yyyy}, ${hours}:${minutes}`;
}

/**
 * either plan, notes or action(state) will have something.
 * Idea being that
 * @param {*} username
 * @param {*} task_state
 * @param {*} task_plan
 * @param {*} dateTime
 * @param {*} action
 * @param {*} notes
 */
async function updateTaskNotes(
	username,
	task_state,
	task_plan,
	dateTime,
	action,
	notes,
	task_id
) {
	let newNotes = `${username} at ${dateTime} `;
	if (task_plan) {
		newNotes += `has changed the plan to ${task_plan}\n`;
	} else if (task_state) {
		newNotes += `has ${action} to ${task_state}\n`;
	} else if (notes) {
		newNotes += `has added the notes: \n${notes}\n`;
	}
	newNotes += `######################################\n\n`;

	try {
		let [val] = await pool.execute(
			"update task set Task_notes = CONCAT(?, Task_notes) where task_id = ?",
			[newNotes, task_id]
		);
		return true;
	} catch (error) {
		console.error(error);
		return false;
	}
}
