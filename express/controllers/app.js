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
			"select app_acronym, app_description, app_Rnumber from application where app_acronym = ?",
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
	let { app_acronym, description, startDate, endDate } = req.body;
	let { permit_create, permit_open, permit_todo, permit_doing, permit_done } =
		req.body;

	// Check for required fields
	if (!app_acronym || !R_number || !description || !startDate || !endDate) {
		return next("Required fields are missing");
	}

	if (
		isValidDate(startDate) &&
		isValidDate(endDate) &&
		!isDateAfter(startDate, endDate)
	) {
		//pass
	} else {
		//fail
		res.status(400).json({
			success: false,
			message: "Date values provide are invalid"
		});
	}

	// Check if app_acronym already exists (excluding the current app)
	try {
		let [val] = await pool.execute(
			`select exists(select 1 from application where app_acronym = ?) as app_exists`,
			[app_acronym]
		);
		if (!val[0].app_exists) {
			return next(
				new ErrorObj("app_acronym does not exist system", 400, "")
			);
		}
	} catch (err) {
		return next(new ErrorObj("Database error", 500, ""));
	}

	//TODO: check all groups provided are valid

	// Update the application record
	try {
		let [val] = await pool.execute(
			"UPDATE application SET app_description = ?, app_Rnumber = ?, app_startDate = ?, app_endDate = ? WHERE app_acronym = ?",
			[app_acronym, description, R_number, startDate, endDate]
		);
		res.status(200).json({
			success: true
		});
	} catch (error) {
		return next("Error with update");
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
	 * If app_acronym already exists
	 */

	if (!app_acronym || !R_number || !description || !startDate || !endDate) {
		res.status(400).json({
			success: false,
			message: "Required fields are missing"
		});
	}

	//TODO: app_acronym validation, alphanumeric and underscore

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

	if (!Number.isInteger(R_number)) {
		console.log();
		res.status(400).json({
			success: false,
			message: "R_number provided is not a valid whole number"
		});
	}

	if (
		isValidDate(startDate) &&
		isValidDate(endDate) &&
		!isDateAfter(startDate, endDate)
	) {
		//pass
	} else {
		//fail
		res.status(400).json({
			success: false,
			message: "Date values provide are invalid"
		});
	}

	//TODO: check all groups provided are valid

	try {
		let [val] = await pool.execute(
			"insert into `application` (`app_acronym`, `app_description`, `app_Rnumber`, `app_startDate`, `app_endDate` ) values (?,?,?,?,?)",
			[app_acronym, description, R_number, startDate, endDate]
		);
		res.status(200).json({
			success: true
		});
	} catch (error) {
		console.log("error with insertion");
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
