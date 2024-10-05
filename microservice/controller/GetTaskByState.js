/** Login
 * Issue a jwt if user credentials are valid
 * @param {string} username
 * @param {string} password
 */
async function login(req, res, next) {
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

	return true;
}

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
			return next(new ErrorObj("Error getting Tasks", 500, ""));
		}
	}
};
