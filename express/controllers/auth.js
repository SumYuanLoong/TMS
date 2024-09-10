const { json } = require("express");
var pool = require("../utils/db");
var ErrorObj = require("../utils/errorMessage");
const userC = require("./users");
const jwt = require("jsonwebtoken");
const bcryt = require("bcrypt");

/**
 * checks if req.user.roles matches provided roles
 * @param  {...any} Roles that can access the route "Admin, Lead, User"
 * @returns
 */
// exports.authoriseRoles = (...Roles) => {
// 	return (req, res, next) => {
// 		if (!Roles.includes(req.user.role)) {
// 			return next(ErrorObj(`Role CMI lah, dont waste my time`, 403));
// 		}
// 		next();
// 	};
// };

exports.checkGroup = async (req, res, next) => {
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
		let decoded = await jwt.verify(token, process.env.JWT_secret); //if this fails, token expire
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

	let { username, group } = req.body;
	// Group validation
	// fail case

	// res.status(403).send();

	//pass case
	next();
};
/**
 * to get token
 * if (req.cookies.token) {
		console.log(req.cookies.token);
	}
 */

/** Login
 * Issue a jwt if user credentials are valid
 *
 * @param {*} req
 * @param {*} res
 */
exports.login = async (req, res) => {
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
	} catch (error) {
		//console.error(error);
		return next(new ErrorObj("Invalid Credentials", 401, ""));
	}
	//password matching
	let matcha = await bcryt.compare(password, val[0].password);
	if (!matcha) {
		return next(new ErrorObj("Invalid Credentials", 401, ""));
	}

	//Create jwt token with some data values
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
exports.logout = async (req, res) => {
	res.clearCookie("token").status(200).send();
};
