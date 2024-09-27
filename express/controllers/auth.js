var pool = require("../utils/db");
var ErrorObj = require("../utils/errorMessage");
const jwt = require("jsonwebtoken");
const bcryt = require("bcrypt");

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

	//Create jwt token with data values
	let token = jwt.sign(
		{
			username: val[0].user_name,
			ipaddress: req.ip,
			browser: req.headers["user-agent"]
		},
		process.env.JWT_secret,
		{
			expiresIn: process.env.EXPIRE_time * 60 * 60 * 1000
		}
	);

	// prep options to send with token in cookie
	const options = {
		expires: new Date(
			Date.now() + process.env.EXPIRE_time * 60 * 60 * 1000
		),
		httpOnly: true
	};

	res.status(200).cookie("token", token, options).json({
		success: true
	});
};

/**Logout
 * Assumption is that the user is already logged in
 * so check valid jwt? and clear/invalidate cookie
 */
exports.logout = async (req, res, next) => {
	res.clearCookie("token").status(200).json({
		success: true
	});
};

/**
 * Verifies JWT then check group user is part of
 * the authorised group
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.verifyToken = async (req, res, next) => {
	// If token exists
	if (req.cookies.token) {
		token = req.cookies.token;
	} else {
		// token not found
		return next(new ErrorObj("Authentication needed", 401, "no token"));
	}

	//Check token is valid
	try {
		var decoded = jwt.verify(token, process.env.JWT_secret); //if this fails, token expire
		if (
			!decoded || // empty token (wrong secret)
			decoded.browser != req.headers["user-agent"] || // user-agent or ip no match
			decoded.ipaddress != req.ip
		) {
			return next(new ErrorObj("Invalid token", 401, ""));
		}
	} catch (error) {
		// this will catch if token expires
		console.log(error);
		return next(new ErrorObj("Invalid token", 401, ""));
	}

	let username = decoded.username;

	// check if user exists, and is not disabled
	try {
		var [val] = await pool.execute(
			`Select user_name, active from users where user_name = ?`,
			[username]
		);
		if (val.length == 0 || !val[0].active) {
			return next(new ErrorObj("Invalid Credentials", 401, ""));
		}
	} catch (error) {
		//console.error(error);
		return next(new ErrorObj("Invalid token", 401, ""));
	}

	next();
};

/**
 * Method to findout the username
 * DEPRECIATED
 */
exports.who = async (req, res, next) => {
	let token = req.cookies.token;
	let decoded = jwt.verify(token, process.env.JWT_secret);
	let username = decoded.username;
	let isAdmin = false;

	//TODO: admin?
	let [list] = await pool.execute(
		"select g.group_name from user_group ug " +
			"JOIN group_list g ON ug.group_id = g.group_id " +
			"where ug.user_name = ?",
		[username]
	);
	for (let index = 0; index < list.length; index++) {
		const element = list[index];
		if (element.group_name.includes("admin")) {
			isAdmin = true;
			break;
		}
	}
	res.status(200).json({
		success: true,
		username: username,
		is_admin: isAdmin
		//isPL: isPL
	});
};

/**
 * This is for usage on the frontend
 * Pre-requisite: Use verifyToken on route
 * @param {} req
 * @param {*} res
 * @param {*} next
 */
exports.auth = async (req, res, next) => {
	let token = req.cookies.token;
	let decoded = jwt.verify(token, process.env.JWT_secret);
	let username = decoded.username;

	let { role } = req.body;

	if (role && checkGroup(username, role)) {
		res.status(200).json({
			success: true,
			authorised: true
		});
	} else {
		res.status(200).json({
			success: true,
			authorised: false
		});
	}
};

/**
 * using username from token, find out the states of the app the user has ownership over
 * Pre-requisite: Use verifyToken on route
 * @param {*} token
 * @param {*} app_acronym
 */
exports.authApp = async (req, res, next) => {
	let token = req.cookies.token;
	let decoded = jwt.verify(token, process.env.JWT_secret);
	let username = decoded.username;
	let permissions = new Set();
	const { app_acronym } = req.body;

	try {
		let [app_permits] = await pool.execute(
			"select app_permit_create, app_permit_open, app_permit_toDoList, app_permit_Doing, app_permit_Done from application where app_acronym = ?",
			[app_acronym]
		);
		app_permits = app_permits[0];

		let statement =
			"SELECT g.group_name " +
			"FROM users u " +
			"JOIN user_group ug ON u.user_name = ug.user_name " +
			"JOIN group_list g ON ug.group_id = g.group_id " +
			"WHERE u.user_name = ?";
		let [user_groups] = await pool.query(statement, [username]);

		user_groups.forEach((group) => {
			if (app_permits.app_permit_create == group.group_name) {
				permissions.add("Create");
			}
			if (app_permits.app_permit_open == group.group_name) {
				permissions.add("Open");
			}
			if (app_permits.app_permit_toDoList == group.group_name) {
				permissions.add("Todo");
			}
			if (app_permits.app_permit_Doing == group.group_name) {
				permissions.add("Doing");
			}
			if (app_permits.app_permit_Done == group.group_name) {
				permissions.add("Done");
			}
		});
		res.status(200).json({
			permissions: Array.from(permissions),
			success: true
		});
	} catch (dberr) {
		res.status(500).json({
			success: false,
			message: dberr
		});
	}

	//return list of state
};

/**
 * This is used for routes that use hardcoded group names
 * Pre-requisite: Use verifyToken on route
 * @param  {...any} roles
 * @returns
 */
exports.authorizedForRoles = (...roles) => {
	return async (req, res, next) => {
		let token = req.cookies.token;
		let decoded = jwt.verify(token, process.env.JWT_secret);
		let username = decoded.username;

		let role = roles; //assumption is that there will only be a max of 1 role
		if (await checkGroup(username, role)) {
			next();
		} else {
			//fail not in group
			return next(new ErrorObj("Invalid Credentials", 401, ""));
		}
	};
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

	let { task_id, app_id } = req.body;
	if (!task_id) {
		try {
			let [val] = pool.execute(
				"select task_state from task where task_id = ?",
				task_id
			);
			state = val[0].task_state;
		} catch (error) {
			return next(new ErrorObj("Cant find task", 401, ""));
		}
	} else {
		state = "create";
	}

	let query = `select app_permit_${state} from Application where app_acronym = ?`;
	try {
		let [val] = await pool.execute(query, [app_id]);
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
