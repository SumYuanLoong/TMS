const { use } = require("../routes/users");
const pool = require("../utils/db");
var ErrorObj = require("../utils/errorMessage");

exports.createGroup = async (req, res, next) => {
	let { groupname } = req.body;
	try {
		let [val] = await pool.execute(
			"insert into group_list (group_name) values (?)",
			[groupname]
		);

		res.status(200).json({
			sucess: true
		});
	} catch (error) {
		return next(new ErrorObj("Unable to create group", 500, ""));
	}
};

exports.getallGroup = async (req, res, next) => {
	try {
		let [val] = await pool.execute("select * from group_list", [groupname]);

		res.status(200).json({
			sucess: true,
			grouplist: val
		});
	} catch (error) {
		return next(new ErrorObj("Unable to create group", 500, ""));
	}
};

/** Called directly by API
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.manageGroup = async (req, res, next) => {
	let { username, grouplist } = req.body;
	// get list of group user is in
	let addlist = [];
	let killlist = [];

	// compare with new list
	try {
		let [list] = await pool.execute(
			"select group_id from user_group where user_name = ?",
			[username]
		);

		// groups not in user_groups
		grouplist.forEach((gID) => {
			if (!list.includes(gID)) {
				addlist.push(gID);
			}
		});

		// groups not in grouplist
		list.forEach((gID) => {
			if (!grouplist.includes(gID)) {
				killlist.push(gID);
			}
		});
	} catch (error) {
		return next(new ErrorObj("Database retrival error", 500, ""));
	}

	// update with remove and add group functions
	await removeGroups(username, killlist);
	await addGroups(username, addlist);

	res.status(200).json({
		success: true
	});
};

async function removeGroups(user_name, list) {
	try {
		list.forEach(async (id) => {
			let [val] = await pool.execute(
				"delete from user_group where user_name = ? and group_id = ?",
				[user_name, id]
			);
		});
	} catch (error) {
		return next(new ErrorObj("Remove group error", 500, ""));
	}
}

async function addGroups(user_name, list) {
	try {
		list.forEach(async (id) => {
			let [val] = await pool.execute(
				"insert into user_group (`user_name`, `group_id`) values (?, ?)",
				[user_name, id]
			);
		});
	} catch (error) {
		return next(new ErrorObj("Add group error", 500, ""));
	}
}
