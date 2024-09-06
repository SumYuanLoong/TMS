const { json } = require("express");
var pool = require("../utils/db");
const userC = require("./users");
const jwt = require("jsonwebtoken");

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

exports.login = async (req, res) => {
	const { username = "Lyndon", password = "fakepassword" } = req.body;

	try {
		let [val, fields] = await pool.execute(
			`Select * from users where 'user_name' = '?'`,
			[username]
		);
		console.log(val);
	} catch (error) {
		console.error(error);
	}
	//jwt need to put username, IP and browser type
	let token = jwt.sign(
		{ username: "", ipaddress: "", browser: "" },
		process.env.JWT_secret,
		{
			expiresIn: process.env.EXPIRE_time
		}
	);

	const options = {
		expires: new Date(
			Date.now() + process.env.EXPIRE_time * 24 * 60 * 60 * 1000
		),
		httpOnly: true
	};

	res.status(200).cookie("token", token, options);
};
