const pool = require("../config/db");
const bcrypt = require("bcryptjs");

const code = {
	auth01: "A001", // invalid username/password
	auth02: "A002", // deactivated
	auth03: "A003", // insufficient group permission
	payload01: "P001", // missing mandatory keys
	transaction01: "T001", // invalid values
	transaction02: "T002", // value out of range
	transaction03: "T003", // task state error
	transaction04: "T004", // error while carrying out transaction
	url01: "U001", // url dont match
	success01: "S001", // success
	error01: "E001" // general error
};
const state = ["open", "todo", "doing", "done", "close"];
/**
 * Gets all task of the Specific app
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.getTasksByState = async (req, res, next) => {
	//console.log(req);
	if (req.originalUrl !== "/api/task/getTaskByState") {
		return res.status(400).json({ code: code.url01 });
	}

	const { username, password, task_appAcronym } = req.body;
	let { task_state } = req.body;

	if (!username || !password || !task_appAcronym || !task_state) {
		return res.status(401).json({ code: code.payload01 });
	}

	if (!state.includes(task_state)) {
		return res.status(400).json({ code: code.transaction02 });
	} else {
		task_state = state.indexOf(task_state);
		task_state = task_state + 1;
	}

	if (password.length > 10) {
		return res.status(401).json({ code: code.auth01 });
	}

	try {
		var [val] = await pool.execute(
			`Select user_name, password, active from users where user_name = ?`,
			[username]
		);
		if (val.length == 0) {
			return res.status(401).json({ code: code.auth01 });
		}
	} catch (error) {
		//console.error(error);
		return res.status(401).json({ code: code.auth01 });
	}
	//password matching and check user disabled
	let matcha = await bcrypt.compare(password, val[0].password);
	if (!matcha) {
		return res.status(401).json({ code: code.auth01 });
	} else if (!val[0].active) {
		return res.status(401).json({ code: code.auth02 });
	}

	if (task_appAcronym) {
		try {
			const [app_check] = await pool.execute(
				`SELECT app_acronym FROM application WHERE app_acronym = ?`,
				[task_appAcronym]
			);
			if (app_check.length === 0) {
				return res.status(400).json({ code: code.transaction01 });
			}

			let [val1] = await pool.execute(
				"select t.task_id, t.task_name, t.task_description, t.task_owner, p.plan_colour as 'plan_color' " +
					"from task t left join plan p on t.task_plan = p.plan_mvp_name and t.task_app_acronym = p.plan_app_acronym " +
					"where t.task_app_acronym = ? and t.task_state = ?",
				[task_appAcronym, task_state]
			);

			res.status(200).json({
				code: code.success01,
				data: val1
			});
		} catch (error) {
			return res.status(401).json({ code: code.transaction04 });
		}
	}
};
