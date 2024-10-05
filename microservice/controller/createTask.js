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
				return res.status(404).json({
					success: false,
					message: "Plan task is set to not found"
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
		task_notes = task_notes + "Created with notes: \n" + input_task_notes;
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
		res.status(500).json({
			success: false,
			message: "Task creation failed"
		});
	}
};
