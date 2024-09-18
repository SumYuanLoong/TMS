const pool = require("../utils/db");
var ErrorObj = require("../utils/errorMessage");

/**
 * Create new group
 * TODO: test
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.createGroup = async (req, res, next) => {
	let { groupname } = req.body;

	const groupRgex = new RegExp(/^[\w]+$/g);
	if (!groupRgex.test(groupname)) {
		return next(new ErrorObj("Username is invalid", 400, ""));
	}

	if (!groupname) {
		return next(new ErrorObj("Groupname is empty", 400, ""));
	}

	try {
		let [val] = await pool.execute(
			"insert into group_list (group_name) values (?)",
			[groupname]
		);

		res.status(200).json({
			success: true
		});
	} catch (error) {
		return next(new ErrorObj("group already exists", 400, ""));
	}
};
/** used when populating dropdown lists
 * TODO: test
 */
exports.getallGroup = async (req, res, next) => {
	try {
		let [val] = await pool.query("select group_name from group_list");

		res.status(200).json({
			success: true,
			grouplist: val
		});
	} catch (error) {
		return next(new ErrorObj("Unable to create group", 500, ""));
	}
};

/** Called directly by API after dropdown change for user management
 * TODO: test
 * @param {string} username
 * @param {List} grouplist selected group_names
 */
exports.manageGroup = async (req, res, next) => {
	let { username, grouplist } = req.body;
	// get list of group user is in
	let addlist = [];
	let killlist = [];
	let holdingList = [];

	// Check user exists
	if (!username) {
		return next(new ErrorObj("Empty Username field", 422, ""));
	}

	if (username == "admin" && !grouplist.includes("admin")) {
		return next(
			new ErrorObj("admin cannot be removed from admin group", 400, "")
		);
	}
	try {
		let [val] = await pool.execute(
			`Select user_name from users where user_name = ?`,
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

	// compare with new list
	try {
		let [list] = await pool.execute(
			"select group_name from user_group ug join group_list g on ug.group_id = g.group_id where user_name = ?",
			[username]
		);

		list.forEach((g_name) => {
			holdingList.push(g_name.group_name);
		});

		// groupslist not in user_groups
		grouplist.forEach((gID) => {
			if (!holdingList.includes(gID)) {
				addlist.push(gID);
			}
		});

		// groups not in grouplist
		list.forEach((gID) => {
			if (!grouplist.includes(gID.group_name)) {
				killlist.push(gID.group_name);
			}
		});

		// update with remove and add group functions
		await removeGroups(username, killlist);
		await this.addGroups(username, addlist);
	} catch (error) {
		return next(new ErrorObj("Database error", 500, ""));
	}

	res.status(200).json({
		success: true
	});
};

async function removeGroups(user_name, list) {
	list.forEach(async (id) => {
		let [val] = await pool.execute(
			"delete ug from user_group ug JOIN group_list g on ug.group_id = g.group_id where user_name = ? AND g.group_name =  ?",
			[user_name, id]
		);
	});
}

/**
 * add groups to user
 * @param {String} user_name
 * @param {List} list group_ids
 * @returns
 */
exports.addGroups = async (user_name, list) => {
	list.forEach(async (id) => {
		let [val] = await pool.execute(
			"select group_id from group_list where group_name = ?",
			[id]
		);

		let [val2] = await pool.execute(
			"insert into user_group (`user_name`, `group_id`) values (?, ?)",
			[user_name, val[0].group_id]
		);
	});
};
