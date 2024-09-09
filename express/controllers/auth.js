const { json } = require("express");
var pool = require("../utils/db");
var errorH = require("../utils/errorHandler");
const userC = require("./users");
const jwt = require("jsonwebtoken");
const bcryt = require("bcrypt");

/**
 * checks if req.user.roles matches provided roles
 * @param  {...any} Roles that can access the route "Admin, Lead, User"
 * @returns
 */
exports.authoriseRoles = (...Roles) => {
	return (req, res, next) => {
		if (!Roles.includes(req.user.role)) {
			return next(Error(`Role CMI lah, dont waste my time`));
		}
		next();
	};
};

exports.checkGroup = async (req, res, next) => {
	// If token exists
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer")
	) {
		token = req.headers.authorization.split(" ")[1];
	}

	//Check if token is valid
	try {
		let decoded = await jwt.verify(token, process.env.JWT_secret); //if this fails, token expire
		if (
			!decoded || // empty token (wrong secret)
			decoded.browser != req.headers["user-agent"] || // user-agent or ip no match
			decoded.ipaddress != req.ip
		) {
			throw error("jwt secret is wrong");
		}
	} catch (error) {
		// this will catch if token expires
		console.log(error);
		return res.status(403).send();
	}

	let { username, group } = req.body;

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

exports.login = async (req, res) => {
	let { username, password } = req.body;

	//TODO: INPUT VALIDATION
	if (!username && !password) {
		res.status(401).json({
			success: false,
			message: "Invalid Credentials"
		});
	}

	try {
		var [val] = await pool.execute(
			`Select * from users where user_name = ?`,
			[username]
		);
	} catch (error) {
		//TODO: proper error message
		//console.error(error);
		res.status(401).json({
			success: false,
			message: "Invalid Credentials"
		});
	}
	//password matching
	let matcha = await bcryt.compare(password, val[0].password);
	if (!matcha) {
		res.status(401).json({
			success: false,
			message: "Invalid Credentials"
		});
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
