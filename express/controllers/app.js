/**
 * Application Controller
 */

const pool = require("../utils/db");
var ErrorObj = require("../utils/errorMessage");

/**
 * Gets all apps
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.getAllApp = async (req, res, next) => {
	try {
		let [val] = await pool.query(
			"select app_acronym, app_description, app_Rnumber from application"
		);
		res.status(200).json({
			success: true,
			applist: val
		});
	} catch (error) {
		console.log("error getting the apps");
	}
};

/**
 * Get 1 app
 */
exports.getApp = async (req, res, next) => {
	let { app_acronym } = req.body;

	//app_acronym validation
	try {
		let [val] = await pool.execute(
			"select * from application where app_acronym = ?",
			[app_acronym]
		);
		if (val.length === 0) {
			res.status(404).json({
				success: false,
				message: "No such app found"
			});
		}
		res.status(200).json({
			success: true,
			applist: val
		});
	} catch (error) {
		console.log("error getting the apps");
	}
};

/**
 * Updates 1 app
 * Pre-req: User has group-level access to manage app
 * TODO: go through and check this is generated
 * @param {string} app_id
 * @param {*} res
 * @param {*} next
 */
exports.updateApp = async (req, res, next) => {
	let { app_acronym, description } = req.body;
	let { permit_create, permit_open, permit_todo, permit_doing, permit_done } =
		req.body;

	// Check for required fields
	if (!app_acronym || !description) {
		return next("Required fields are missing");
	}

	//TODO: check all groups provided are valid
	if (permit_create && !groupCheck(permit_create)) {
		return res.status(400).json({
			success: false,
			message: "Create group does not exist"
		});
	}
	if (permit_doing && !groupCheck(permit_doing)) {
		return res.status(400).json({
			success: false,
			message: "Doing group does not exist"
		});
	}
	if (permit_done && !groupCheck(permit_done)) {
		return res.status(400).json({
			success: false,
			message: "Done group does not exist"
		});
	}
	if (permit_open && !groupCheck(permit_open)) {
		return res.status(400).json({
			success: false,
			message: "Open group does not exist"
		});
	}
	if (permit_todo && !groupCheck(permit_todo)) {
		return res.status(400).json({
			success: false,
			message: "Todo group does not exist"
		});
	}

	// Update the application record
	try {
		let [val] = await pool.query(
			`update application set App_Description = ?, App_permit_Create = ?, App_permit_Open = ?, App_permit_Todo = ?, App_permit_Doing = ?, App_permit_Done =? WHERE app_acronym = ?`,
			[
				description,
				permit_create,
				permit_open,
				permit_todo,
				permit_doing,
				permit_done,
				app_acronym
			]
		);
		res.status(200).json({
			success: true
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			success: false,
			message: "Error with updating row"
		});
	}
};

/**
 * Create app
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.createApp = async (req, res, next) => {
	let { app_acronym, R_number, description, startDate, endDate } = req.body;
	let { permit_create, permit_open, permit_todo, permit_doing, permit_done } =
		req.body;

	/**
	 * checks to do
	 * mandatory app_acronym, R_number, startDate, endDate
	 * check format and validity of the start and end date
	 *
	 */

	if (!app_acronym || typeof R_number === Number || !startDate || !endDate) {
		return res.status(400).json({
			success: false,
			message: "Required fields are missing"
		});
	}

	//app_acronym validation, alphanumeric and underscore
	const appRegex = new RegExp(/^[\w]+$/g);
	if (!appRegex.test(app_acronym)) {
		return res.status(400).json({
			success: false,
			message: "App acronym provided is invalid"
		});
	}

	if (!Number.isInteger(R_number) || R_number < 0) {
		return res.status(400).json({
			success: false,
			message: "R_number provided must be positive and an integer"
		});
	}

	// date validation
	if (!isValidDate(startDate) || !isValidDate(endDate)) {
		//fail
		return res.status(400).json({
			success: false,
			message: "Date values provided are invalid"
		});
	} else if (isDateAfter(startDate, endDate)) {
		//fail
		return res.status(400).json({
			success: false,
			message: "Start Date after end date"
		});
	}

	// check if name already exists
	try {
		let [val] = await pool.execute(
			`select exists(select 1 from application where app_acronym = ?) as app_exists`,
			[app_acronym]
		);
		if (val[0].app_exists) {
			return next(
				new ErrorObj(
					"app_acronym already exists in the system",
					400,
					""
				)
			);
		}
	} catch (err) {
		return next(new ErrorObj("Database error", 500, ""));
	}

	//TODO: check all groups provided are valid
	if (permit_create && !groupCheck(permit_create)) {
		return res.status(400).json({
			success: false,
			message: "Create group does not exist"
		});
	}
	if (permit_doing && !groupCheck(permit_doing)) {
		return res.status(400).json({
			success: false,
			message: "Doing group does not exist"
		});
	}
	if (permit_done && !groupCheck(permit_done)) {
		return res.status(400).json({
			success: false,
			message: "Done group does not exist"
		});
	}
	if (permit_open && !groupCheck(permit_open)) {
		return res.status(400).json({
			success: false,
			message: "Open group does not exist"
		});
	}
	if (permit_todo && !groupCheck(permit_todo)) {
		return res.status(400).json({
			success: false,
			message: "Todo group does not exist"
		});
	}

	try {
		let [val] = await pool.execute(
			"insert into `application` (`App_Acronym`, `App_Description`, `app_Rnumber`, `app_startDate`, " +
				"`app_endDate`, `App_permit_Create`,`App_permit_Open`,`App_permit_Todo`,`App_permit_Doing`, " +
				"`App_permit_Done` ) values " +
				"(?,?,?,?,?,?,?,?,?,?)",
			[
				app_acronym,
				description,
				R_number,
				startDate,
				endDate,
				permit_create,
				permit_open,
				permit_todo,
				permit_doing,
				permit_done
			]
		);
		res.status(200).json({
			success: true
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Error with inserting row"
		});
	}
};

// checks for valid date string
function isValidDate(dateString) {
	const parts = dateString.split("-");
	const day = parseInt(parts[0], 10);
	const month = parseInt(parts[1], 10) - 1; // Months are 0-based in JavaScript
	const year = parseInt(parts[2], 10);
	const date = new Date(year, month, day);
	return (
		date.getDate() === day &&
		date.getMonth() === month &&
		date.getFullYear() === year
	);
}

// check date before or after, returns true if its a situation we do not want
function isDateAfter(date1, date2) {
	const [day1, month1, year1] = date1.split("-");
	const [day2, month2, year2] = date2.split("-");

	if (year1 > year2) {
		return true;
	} else if (year1 === year2 && month1 > month2) {
		return true;
	} else if (year1 === year2 && month1 === month2 && day1 > day2) {
		return true;
	} else {
		return false;
	}
}
async function groupCheck(group_name) {
	let [val] = await pool.execute(
		"select exists(select 1 from group_list where group_name = ?) as group_exists",
		[group_name]
	);
	if (val[0].group_exists) {
		return true;
	} else {
		return false;
	}
}
