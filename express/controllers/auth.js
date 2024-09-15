var pool = require("../utils/db");
var ErrorObj = require("../utils/errorMessage");
const jwt = require("jsonwebtoken");
const bcryt = require("bcrypt");

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
		success: true
	});
};

/**Logout
 * Assumption is that the user is already logged in
 * so check valid jwt? and clear/invalidate cookie
 */
exports.logout = async (req, res, next) => {
	res.clearCookie("token").status(200).send();
};
