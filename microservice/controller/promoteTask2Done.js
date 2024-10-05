/** Login
 * Issue a jwt if user credentials are valid
 * @param {string} username
 * @param {string} password
 */
exports.login = async (req, res, next) => {
	let { username, password } = req.body;

	//INPUT VALIDATION
	if (!username && !password) {
		return next(new ErrorObj("Invalid Credentials", 401, ""));
	}

	try {
		var [val] = await pool.execute(
			`Select * from users where user_name = ?`,
			[username]
		);
		if (val.length == 0) {
			return next(new ErrorObj("Invalid Credentials", 401, ""));
		}
	} catch (error) {
		//console.error(error);
		return next(new ErrorObj("Invalid Credentials", 401, ""));
	}
	//password matching and check user disabled
	let matcha = await bcryt.compare(password, val[0].password);
	if (!matcha || !val[0].active) {
		return next(new ErrorObj("Invalid Credentials", 401, ""));
	}

	res.status(200).cookie("token", token, options).json({
		success: true
	});
};

/**
 * This is used for routes that are task related
 * Pre-requisite: Use verifyToken on route
 * @param  {}
 * @returns
 */
exports.authorisedForTasks = async (req, res, next) => {
	let token = req.cookies.token;
	let decoded = jwt.verify(token, process.env.JWT_secret);
	let username = decoded.username;
	let state = "";
	let role = "";

	let { task_id, app_acronym } = req.body;
	if (task_id) {
		try {
			let [val] = await pool.execute(
				`select task_state from task where task_id = ?`,
				[task_id]
			);
			state = val[0].task_state;
		} catch (error) {
			return next(new ErrorObj("Cant find task", 401, ""));
		}
	} else {
		state = "Create";
	}

	let query = `select app_permit_${state} from Application where app_acronym = ?`;
	try {
		let [val] = await pool.execute(query, [app_acronym]);
		const prop = "app_permit_" + state;
		role = val[0][prop];
	} catch (error) {
		return next(new ErrorObj("Error Getting Permissions", 401, ""));
	}

	if (await checkGroup(username, role)) {
		next();
	} else {
		//fail not in group
		return next(new ErrorObj("Invalid Credentials", 401, ""));
	}
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
				if (!email) {
					email = "PL@tms.com";
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
