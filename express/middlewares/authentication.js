var pool = require("../utils/db");
var ErrorObj = require("../utils/errorMessage");
const jwt = require("jsonwebtoken");

/**
 * other way to get token
 * if (req.cookies.token) {
		console.log(req.cookies.token);
	}
 */

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
		var decoded = await jwt.verify(token, process.env.JWT_secret); //if this fails, token expire
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
	req.username = decoded.username;

	//TODO: how to find out allowed groups
	if (req.authRole) {
		if (checkGroup(username, req.authRole)) {
			return next();
		} else {
			//fail not in group
			res.status(403).send();
		}
	}
	next();
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

	// if any in val/grp matches any id of the input
	if (val.some((grp) => groups.includes(grp.group_name))) {
		return true;
	} else {
		return false;
	}
}

exports.authorizeRoles = (...roles) => {
	return (req, res, next) => {
		req.authRole = [];
		roles.forEach((role) => {
			req.authRole.push(role);
		});
		next();
	};
};
