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
