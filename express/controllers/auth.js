const { json } = require("express");
var pool = require("../utils/db");
var ErrorObj = require("../utils/errorMessage");
const userC = require("./users");
const jwt = require("jsonwebtoken");
const bcryt = require("bcrypt");

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
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer")
	) {
		token = req.headers.authorization.split(" ")[1];
	} else {
		// token not found
		return next(new ErrorObj("Authentication needed", 401, "no token"));
	}

	//Check if token is valid
	try {
		var decoded = await jwt.verify(token, process.env.JWT_secret); //if this fails, token expire
		if (
			!decoded || // empty token (wrong secret)
			decoded.browser != req.headers["user-agent"] || // user-agent or ip no match
			decoded.ipaddress != req.ip
		) {
			//TODO: proper error handling
			return next(new ErrorObj("Invalid token", 401, ""));
		}
	} catch (error) {
		// this will catch if token expires
		console.log(error);
		return next(new ErrorObj("Invalid token", 401, ""));
	}

	let username = decoded.username;
	//req.username = decoded.username;

	//inserting hardcoded authorised groups
	//TODO: extraction of allowed groups
	let authGroups = [1, 4];
	if (checkGroup(username, authGroups)) {
		next();
	} else {
		//fail not in group
		res.status(403).send();
	}
};
/**
 * other way to get token
 * if (req.cookies.token) {
		console.log(req.cookies.token);
	}
 */

/** Login
 * Issue a jwt if user credentials are valid
 * @param {*} req
 * @param {*} res
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
		success: true,
		token
	});
};

/**Logout
 * Assumption is that the user is already logged in
 * so check valid jwt? and clear/invalidate cookie
 */
exports.logout = async (req, res, next) => {
	res.clearCookie("token").status(200).send();
};

exports.getGroups = async (req, res, next) => {
	// to get the app of the task
	// get app_permit
	// return for use in checkGroup
};

/**
 * Check if the user is in these groups
 * @param {*} username username of the user preferably from JWT
 * @param {*} groups list of group_ids permitted to access
 * @returns
 */
async function checkGroup(username, groups) {
	// Group validation
	try {
		let statement =
			"SELECT g.group_name, g.group_id " +
			"FROM users u " +
			"JOIN user_group ug ON u.user_name = ug.user_name " +
			"JOIN group_list g ON ug.group_id = g.group_id " +
			"WHERE u.user_name = ?";
		var [val] = await pool.query(statement, [username]);
	} catch (dberr) {
		return false;
	}

	if (val.some((grp) => groups.includes(grp.group_id))) {
		return true;
	}
}
