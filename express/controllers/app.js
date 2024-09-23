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
		if (val.length == 0) {
			console.log("no such app found");
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
	let { app_acronym, R_number, description, startDate, endDate } = req.body;
	let { permit_create, permit_open, permit_todo, permit_doing, permit_done } =
		req.body;

	// Check for required fields
	if (!app_acronym || !R_number || !description || !startDate || !endDate) {
		return next("Required fields are missing");
	}

	// Validate R_number
	if (!Number.isInteger(R_number)) {
		return next("R_number provided is not a whole number");
	}

	// Check if app_acronym already exists (excluding the current app)
	try {
		let [val] = await pool.execute(
			`SELECT app_Rnumber FROM application WHERE app_acronym = ?`,
			[app_acronym]
		);
		if (val.length == 0) {
			return next(
				new ErrorObj("app_acronym does not exist system", 400, "")
			);
		}
	} catch (err) {
		return next(new ErrorObj("Database error", 500, ""));
	}

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
// What to do for change state

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
		console.log("Required fields are missings");
	}

	try {
		let [val] = await pool.execute(
			`Select app_Rnumber from application where app_acronym = ?`,
			[app_acronym]
		);
		if (val.length > 0) {
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

	R_number = Number.parseInt(R_number);
	if (!Number.isInteger(R_number)) {
		console.log("R_number provided is not a whole number");
	}

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
