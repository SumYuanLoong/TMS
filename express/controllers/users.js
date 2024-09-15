const pool = require("../utils/db");
const bcrypt = require("bcrypt");
var ErrorObj = require("../utils/errorMessage");

/**
 * Gets all users with groups that they belong in
 * @returns list of user objects, each with list of group objs they belong in
 */
exports.getAllUser = async (req, res, next) => {
	let userList = [];

	//get all users and place in list
	try {
		let [val] = await pool.query(
			"Select user_name, email, active from users"
		);

		val.forEach((user) => {
			let container = {
				username: user.user_name,
				email: user.email,
				active: user.active,
				group_names: [],
				group_ids: []
			};
			userList.push(container);
		});
	} catch (err) {
		return next(
			new ErrorObj("Error retriving user table from database", 500, "")
		);
	}

	//get groups and update userobjs with their groups
	try {
		let statement =
			"SELECT u.user_name, g.group_name, g.group_id " +
			"FROM users u " +
			"JOIN user_group ug ON u.user_name = ug.user_name " +
			"JOIN group_list g ON ug.group_id = g.group_id ";
		let [val] = await pool.query(statement);
		userList.forEach((user) => {
			let filtered = val.filter((ug) => ug.user_name == user.username);
			filtered.forEach((ugf) => {
				user.group_names.push(ugf.group_name);
				user.group_ids.push(ugf.group_id);
			});
		});
	} catch (error) {
		return next(
			new ErrorObj(
				"Error retriving user group details from database",
				500,
				""
			)
		);
	}

	res.status(200).json({
		success: true,
		userList: userList
	});
};

/**To be used in user profile page only therefore groups are not added to call
 *
 * @param {string} username
 * @returns
 */
exports.getOneUser = async (req, res, next) => {
	const username = req.username;

	//data sanitise
	if (!username) {
		return next(new ErrorObj("Empty Username field", 422, ""));
	}

	try {
		let [val, fields] = await pool.execute(
			`Select * from users where user_name = ?`,
			[username]
		);
		if (val.length == 0) {
			return next(new ErrorObj("User not found", 404, ""));
		} else {
			let user = {
				username: val[0].user_name,
				email: val[0].email
			};
			res.status(200).json({
				user
			});
		}
	} catch (err) {
		return next(
			new ErrorObj("Unable to retrive user from database", 500, "")
		);
	}
};

/** Create user and add to groups if provided
 * @param {string} username Unique username
 * @param {string} password Password to have alphanumeric and symbol
 * @param {list} groups group_ids, default null
 */
exports.createUser = async (req, res, next) => {
	const { username, password, grouplist, email } = req.body;
	// Input Validation regex
	if (!username || !password) {
		return next(new ErrorObj("Empty field(s)", 422, ""));
	}

	// check password meets requirements ((?=.*\d)(?=.*[a-zA-Z])(?=.*[\W\_]).{8,10})
	const regex = new RegExp(/((?=.*\d)(?=.*[a-zA-Z])(?=.*[\W\_]).{8,10})/g);
	if (!regex.test(password)) {
		return next(
			new ErrorObj(
				"Password does not meet complexity requirements",
				400,
				""
			)
		);
	}

	//TODO: email validation
	if (!email) {
		// email no match pattern
	}

	//check username exists?
	try {
		let [val, fields] = await pool.execute(
			`Select * from users where user_name = ?`,
			[username]
		);
		if (val.length > 0) {
			console.log("user exists");
			return next(
				new ErrorObj("Username already exists in the system", 400, "")
			);
		}
	} catch (err) {
		return next(new ErrorObj("Database error", 500, ""));
	}

	// hash password
	let hashed = bcrypt.hashSync(password, 10);

	// insert into DB
	try {
		let [val] = await pool.execute(
			"Insert into `users` (`user_name`, `password`, `email`, `active`) values (?,?,?, 1)",
			[username, hashed, email || null]
		);
		//Considering checking val if the rows is created as required
	} catch (error) {
		return next(
			new ErrorObj(
				"Error inserting into Database, no new rows created",
				500,
				""
			)
		);
	}
	// TODO:if have groups, append user_group table

	// return
	res.status(200).json({
		success: true
	});
};

/**
 * To be used in userprofile and user management
 * @param {username} username user must be created
 * @param {string} email
 * @returns boolean Success
 */
exports.updateEmail = async (req, res, next) => {
	// Validate inputs
	const { username, email } = req.body;

	// Check user exists
	if (!username) {
		return next(new ErrorObj("Empty Username field", 422, ""));
	}

	try {
		let [val, fields] = await pool.execute(
			`Select * from users where user_name = ?`,
			[username]
		);
		if (val.length == 0) {
			return next(new ErrorObj("User not found", 404, ""));
		}
	} catch (err) {
		return next(
			new ErrorObj("Unable to retrive user from database", 500, "")
		);
	}

	// Update fields
	try {
		let [val] = await pool.execute(
			`update users set email = ? where user_name = ?`,
			[email || null, username]
		);
		if (val.affectedRows == 1) {
			res.status(200).json({
				success: true,
				message: "User updated"
			});
		}
	} catch (error) {
		return next(new ErrorObj("Unable to update user", 500, ""));
	}
};

/**
 * To be used in userprofile and user management
 * @param {username} username user must be created
 * @param {string} password string that meets password requirements
 * @returns boolean Success
 */
exports.updatePassword = async (req, res, next) => {
	// Validate inputs
	const { username, password } = req.body;

	// Check user exists
	if (!username) {
		return next(new ErrorObj("Empty Username field", 422, ""));
	}
	// check password meets requirements ((?=.*\d)(?=.*[a-zA-Z])(?=.*[\W\_]).{8,10})
	const regex = new RegExp(/((?=.*\d)(?=.*[a-zA-Z])(?=.*[\W\_]).{8,10})/g);
	if (!regex.test(password)) {
		return next(
			new ErrorObj(
				"Password does not meet complexity requirements",
				400,
				""
			)
		);
	}

	try {
		let [val, fields] = await pool.execute(
			`Select * from users where user_name = ?`,
			[username]
		);
		if (val.length == 0) {
			return next(new ErrorObj("User not found", 404, ""));
		}
	} catch (err) {
		return next(
			new ErrorObj("Unable to retrive user from database", 500, "")
		);
	}

	let hashed = bcrypt.hashSync(password, 10);

	// Update fields
	try {
		let [val] = await pool.execute(
			`update users set password = ? where user_name = ?`,
			[hashed, username]
		);
		if (val.affectedRows == 1) {
			res.status(200).json({
				success: true,
				message: "User updated"
			});
		}
	} catch (error) {
		return next(new ErrorObj("Unable to update user", 500, ""));
	}
};

/**
 * To be used in user management
 * @param {username} username user must be created and not already disabled
 * @returns boolean Success
 */
exports.killUser = async (req, res, next) => {
	// validate inputs
	const { username } = req.body;

	// Check user exists and status
	if (!username) {
		return next(new ErrorObj("Empty Username field", 422, ""));
	} else if (username == process.env.SUPERUSER) {
		return next(new ErrorObj("Admin cannot be disabled", 422, ""));
	}

	try {
		let [val, fields] = await pool.execute(
			`Select * from users where user_name = ?`,
			[username]
		);
		if (val.length == 0) {
			return next(new ErrorObj("User not found", 404, ""));
		} else if (val[0].active == 0) {
			return next(new ErrorObj("User already disabled", 400, ""));
		}
	} catch (err) {
		return next(
			new ErrorObj("Unable to retrive user from database", 500, "")
		);
	}
	// disable user
	try {
		let [val] = await pool.execute(
			`update users set active = 0 where user_name = ?`,
			[username]
		);
		if (val.affectedRows == 1) {
			res.status(200).json({
				success: true,
				message: "User disabled"
			});
		}
	} catch (error) {
		return next(
			new ErrorObj("Unable to disable user in database", 500, "")
		);
	}
};

/**
 * password needs to check empty
 * email check empty
 * group?
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
// exports.updateUser = async (req, res, next) => {
// 	const { username, email, password, grouplist } = req.body;
// 	let mail = false,
// 		pass = false,
// 		group = false;

// 	if (!username) {
// 		return next(new ErrorObj("Empty Username field", 422, ""));
// 	}

// 	//check what is being updated
// 	if (email) mail = true;
// 	if (password) pass = true;
// 	if (grouplist) group = true;

// 	// Check user exists
// 	try {
// 		var [val, fields] = await pool.execute(
// 			`Select * from users where user_name = ?`,
// 			[username]
// 		);
// 		if (val.length == 0) {
// 			return next(new ErrorObj("User not found", 404, ""));
// 		}
// 	} catch (err) {
// 		return next(
// 			new ErrorObj("Unable to retrive user from database", 500, "")
// 		);
// 	}

// 	if (mail && val[0].email == email) {
// 		//if new mail == old email
// 		mail = false;
// 	} else if (val[0].email && !mail) {
// 		// if mail is set to empty
// 		mail = true;
// 	}

// 	if (pass) {
// 		const regex = new RegExp(
// 			/((?=.*\d)(?=.*[a-zA-Z])(?=.*[\W\_]).{8,10})/g
// 		);
// 		if (!regex.test(password)) {
// 			return next(
// 				new ErrorObj(
// 					"Password does not meet complexity requirements",
// 					400,
// 					""
// 				)
// 			);
// 		}
// 		var hashed = bcrypt.hashSync(password, 10);
// 	}
// };
