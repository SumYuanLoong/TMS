const pool = require("../utils/db");
const bcrypt = require("bcrypt");
var ErrorObj = require("../utils/errorMessage");

/**
 * To use prepared statements, use pool.execute('query', [data,'data'])
 * This will internally call prepare and query seperately
 */
exports.getAllUser = async (req, res) => {
	try {
		let [val, fields] = await pool.query("Select * from users");

		res.status(200).json({
			success: true,
			userList: val
		});
	} catch (err) {
		return next(
			new ErrorObj("Error retriving data from database", 500, "")
		);
	}
};

exports.getOneUser = async (req, res) => {
	const { username } = req.body;

	//data sanitise
	if (!username) {
		return next(new ErrorObj("Empty Username field", 422, ""));
	}

	try {
		let [val, fields] = await pool.execute(
			`Select * from users where 'username' = ?`,
			[username]
		);
		if (val.length == 0) {
			return next(new ErrorObj("User not found", 404, ""));
		}
		res.status(200).json({
			userList: val
		});
	} catch (err) {
		return next(
			new ErrorObj("Unable to retrive user from database", 500, "")
		);
	}
};

/** Create user and add to group if provided
 * Assumed user validation is done
 *
 * @param {string} username Unique username
 * @param {string} password Password to have alphanumeric and symbol
 * @param {list} groups default null
 */
exports.createUser = async (req, res) => {
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

exports.updateUser = async (req, res) => {};
