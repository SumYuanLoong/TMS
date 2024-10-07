const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const mailer = require("../config/mailer");
const code = {
	auth01: "A001", // invalid username/password
	auth02: "A002", // deactivated
	auth03: "A003", // insufficient group permission
	payload01: "P001", // missing mandatory keys
	payload02: "P002", // invalid values
	payload03: "P003", // value out of range
	payload04: "P004", // task state error
	transaction01: "T001", // error while carrying out transaction
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

exports.promoteTask2Done = async (req, res, next) => {
	console.log("test2");
	if (req.originalUrl !== "/api/task/promoteTask2Done") {
		return res.status(400).json({ code: code.url01 });
	}

	const { username, password, task_id } = req.body;

	if (!username || !password || !task_id) {
		return res.status(401).json({ code: code.payload01 });
	}

	if (password.length > 10) {
		return res.status(401).json({ code: code.auth01 });
	}

	//Login
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
	let matcha = await bcrypt.compare(password, val[0].password);
	if (!matcha) {
		return res.status(401).json({ code: code.auth01 });
	} else if (!val[0].active) {
		return res.status(401).json({ code: code.auth02 });
	}

	// get app and therefore app_permit
	let state = "";
	let role = "";
	let app_acronym = "";
	try {
		//does task_id exist
		let [val] = await pool.execute(
			`select task_state, task_app_acronym from task where task_id = ?`,
			[task_id]
		);
		if (val.length === 0) {
			return res.status(400).json({ code: code.payload02 });
		}
		state = val[0].task_state;
		app_acronym = val[0].task_app_acronym; //app will exist if task exists
	} catch (error) {
		return res.status(401).json({ code: code.transaction01 });
	}

	let query = `select app_permit_${state} from Application where app_acronym = ?`;
	try {
		let [val] = await pool.execute(query, [app_acronym]);
		const prop = "app_permit_" + state;
		role = val[0][prop];
	} catch (error) {
		return res.status(401).json({ code: code.transaction01 });
	}

	if (!(await checkGroup(username, role))) {
		//fail not in group
		return res.status(401).json({ code: code.auth03 });
	}

	// promote
	let email, task_name, task_app_acronym;
	try {
		let [check] = await pool.execute(
			`select case when task_state = 3 then true else false end as task_is_doing
			from task where task_id = ?`,
			[task_id]
		);
		if (!check[0].task_is_doing) {
			return res.status(401).json({ code: code.payload04 });
		}

		let [val] = await pool.execute(
			`update task set task_state = 4, task_owner = ? where task_id = ?`,
			[username, task_id]
		);
		if (val.affectedRows === 0) {
			return res.status(401).json({ code: code.transaction01 });
		} else {
			if (
				await updateTaskNotes(
					username,
					"Done",
					null,
					getDatetime(),
					"promote",
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
				if (!email) {
					email = "PL@tms.com";
				}

				await sendEmail(email, task_name, username, task_app_acronym);
				res.status(200).json({
					success: code.success01
				});
			}
		}
	} catch (error) {
		console.log(error);
		return res.status(401).json({ code: code.transaction01 });
	}
};

/**
 * sample usage: sendEmail(username, task_name, username, app_acronym);
 * @param {*} user task creator
 * @param {*} task_name
 * @param {*} promotor user that promoted it
 * @param {*} app_acronym
 */
async function sendEmail(email, task_name, promotor, app_acronym) {
	try {
		const info = mailer.sendMail({
			from: '"TMS" <no-reply.TMS@ethereal.email>', // sender address
			to: `${email}`, // list of receivers
			subject: `${task_name} is done`, // Subject line
			text: `${task_name} for ${app_acronym} has been promoted to the done state by ${promotor}` // plain text body
			//html: "<b>Hello world?</b>" // html body
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message: "Error Sending email, Task set to Done"
		});
	}
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
		newNotes += `has ${action} task to ${task_state}\n`;
	} else if (notes) {
		newNotes += `has added the notes: \n${notes}\n`;
	}
	newNotes += `\n######################################\n`;

	try {
		let [val] = await pool.execute(
			"update task set Task_notes = CONCAT(?, Task_notes),task_owner = ? where task_id = ?",
			[newNotes, username, task_id]
		);
		return true;
	} catch (error) {
		console.error(error);
		return false;
	}
}
