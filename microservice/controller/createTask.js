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

/**
 * Check if the user is in these groups
 * @param {*} username username of the user preferably from JWT
 * @param {*} groups list of group_ids permitted to access
 * @returns
 */
async function checkGroup(username, group) {
	// Group validation
	try {
		let statement =
			"SELECT g.group_name " +
			"FROM users u " +
			"JOIN user_group ug ON u.user_name = ug.user_name " +
			"JOIN group_list g ON ug.group_id = g.group_id " +
			"WHERE u.user_name = ?";
		var [val] = await pool.query(statement, [username]);
	} catch (dberr) {
		return false;
	}
	for (let index = 0; index < val.length; index++) {
		const element = val[index];
		if (group.includes(element.group_name)) {
			return true;
		}
	}
	// if any in val/grp matches any id of the input
	return false;
}

/**
 * Create task
 * need check for same name within 1 app
 * TODO: transaction
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.createTask = async (req, res, next) => {
	if (req.originalUrl !== "/api/task/createTask") {
		return res.status(400).json({ code: code.url01 });
	}
	//something or the others
	let {
		username,
		password,
		task_name,
		task_description,
		task_appAcronym,
		task_plan,
		task_notes
	} = req.body;

	if (!task_name || !task_appAcronym || !username || !password) {
		return res.status(401).json({ code: code.payload01 });
	}

	if (task_name.length > 64) {
		return res.status(401).json({ code: code.transaction02 });
	}
	if (password.length > 10) {
		return res.status(401).json({ code: code.auth01 });
	}
	if (task_description?.length > 255) {
		return res.status(401).json({ code: code.transaction02 });
	}
	if (task_notes?.length > 65535) {
		return res.status(401).json({ code: code.transaction02 });
	}
	//login
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

	// get app and therefore app_permit
	let state = "Create";
	let role = "";

	let query = `select app_permit_${state} from Application where app_acronym = ?`;
	try {
		let [val] = await pool.execute(query, [task_appAcronym]);
		if (val.length === 0) {
			return res.status(400).json({ code: code.transaction01 });
		}
		const prop = "app_permit_" + state;
		role = val[0][prop] || "";
	} catch (error) {
		return res.status(401).json({ code: code.transaction04 });
	}

	if (!(await checkGroup(username, role))) {
		//fail not in group
		return res.status(401).json({ code: code.auth03 });
	}

	try {
		let [val] = await pool.execute(
			`select exists(select 1 from application where app_acronym = ?) as app_exists`,
			[task_appAcronym]
		);
		if (!val[0].app_exists) {
			return res.status(400).json({ code: code.transaction01 });
		}
	} catch (err) {
		return res.status(401).json({ code: code.transaction04 });
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
	if (task_plan) {
		//do validation
		try {
			let [val] = await pool.execute(
				`select exists(select 1 from plan where Plan_app_Acronym = ? and Plan_MVP_name = ? ) as plan_exists`,
				[task_appAcronym, task_plan]
			);
			if (!val[0].plan_exists) {
				return res.status(400).json({ code: code.transaction01 });
			}
		} catch (error) {
			return res.status(401).json({ code: code.transaction04 });
		}
	}

	let act_task_notes = `${username} has created task ${task_name} at ${formattedDatetime}. \n Task is now open. \n`;
	if (task_notes) {
		act_task_notes = act_task_notes + "Created with notes: \n" + task_notes;
	}

	await pool.query("START transaction");

	try {
		//get app_Rnumber
		let [val1] = await pool.execute(
			"select app_rnumber from application where app_acronym = ?",
			[task_appAcronym]
		);

		//increment it
		let Rnum = val1[0].app_rnumber + 1;

		const task_id = task_appAcronym + "_" + Rnum;
		console.log("1");
		let [val2] = await pool.execute(
			"insert into task " +
				"(task_id, task_name, task_description, task_state, task_creator, task_owner, task_createDate, " +
				"task_notes, task_plan, task_app_acronym) " +
				"values (?,?,?,?,?,?,?,?,?,?)",
			[
				task_id,
				task_name,
				task_description || null,
				"Open",
				username,
				username,
				formattedDate,
				act_task_notes || null,
				task_plan || null,
				task_appAcronym
			]
		);
		console.log("2");

		let [val3] = await pool.execute(
			"Update application set app_Rnumber = ? where app_acronym = ?",
			[Rnum, task_appAcronym]
		);
		await pool.query("COMMIT");
		console.log("3");
		res.status(200).json({
			task_id: task_id,
			code: code.success01
		});
	} catch (error) {
		await pool.query("ROLLBACK");
		if (error.code === "ER_DUP_ENTRY") {
			return res.status(500).json({ code: code.transaction04 });
		} else {
			return res.status(500).json({ code: code.error01 });
		}
	}
};
