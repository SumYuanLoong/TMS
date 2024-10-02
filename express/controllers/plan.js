/**
 * Plan Controller
 */

const pool = require("../utils/db");
var ErrorObj = require("../utils/errorMessage");

/**
 * Gets all plans of the Specific app
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.getAllPlan = async (req, res, next) => {
	let { plan_app_acronym } = req.body;

	try {
		let [val] = await pool.execute(
			"select exists (select 1 from application where app_acronym = ?) as app_exists",
			[plan_app_acronym]
		);
		if (!val[0].app_exists) {
			return res.status(400).json({
				success: false,
				message: "No such Application found"
			});
		}
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Error doing application validation"
		});
	}

	try {
		let [val] = await pool.query(
			"select Plan_MVP_name, plan_colour from plan where plan_app_acronym = ?",
			[plan_app_acronym]
		);
		res.status(200).json({
			success: true,
			planList: val
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Error getting plans"
		});
	}
};

/**
 * Get 1 plan
 */
exports.getPlan = async (req, res, next) => {
	let { plan_app_acronym, plan_name } = req.body;
	try {
		let [val] = await pool.query(
			"select Plan_MVP_name, plan_colour, plan_app_acronym, plan_startDate, plan_endDate from plan where Plan_MVP_name = ? and Plan_app_acronym = ?",
			[something, somethingElse]
		);
		if (val.length == 0) {
			console.log("Plan does not exists");
		}
		res.status(200).json({
			success: true,
			plan: val[0]
		});
	} catch (error) {
		console.log("error getting the apps");
	}
};

/**
 * Updates 1 plan
 * Pre-req: User has group-level access to manage plan
 * @param {string} plan_id
 * @param {*} res
 * @param {*} next
 */
exports.updatePlan = async (req, res, next) => {
	let { plan_name, plan_startDate, plan_endDate, colour } = req.body;

	if (
		!plan_name ||
		!plan_app_acronym ||
		!plan_startDate ||
		!plan_endDate ||
		!colour
	) {
		res.status(400).json({
			success: false,
			message: "Required fields are missing"
		});
	}

	// date validation
	if (!isValidDate(startDate) || !isValidDate(endDate)) {
		//fail
		return res.status(400).json({
			success: false,
			message: "Date values provide are invalid"
		});
	} else if (isDateAfter(startDate, endDate)) {
		//fail
		return res.status(400).json({
			success: false,
			message: "Start Date after end date"
		});
	}

	//Check if plan exists
	try {
		let [val] = await pool.execute(
			"select exists(select 1 from plan where plan_MVP_name = ?) as plan_exists",
			[plan_name]
		);
		if (val[0].plan_exists) {
			//app exists
		}
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Error doing plan validation"
		});
	}

	//(`plan_app_acronym`, `plan_MVP_name`, `plan_startDate`, `plan_endDate`, `plan_colour` )

	try {
		let [val] = await pool.execute(
			"update plan set plan_startDate = ?, plan_endDate = ?, plan_colour = ? where plan_MVP_name = ? ",
			[plan_name]
		);
		if (val[0].plan_exists) {
			//app exists
		}
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Error doing plan validation"
		});
	}
};

/**
 * Create plan
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.createPlan = async (req, res, next) => {
	let { plan_name, plan_startDate, plan_endDate, plan_app_acronym, colour } =
		req.body;

	console.log(req.body);
	if (!plan_name || !plan_app_acronym || !plan_startDate || !plan_endDate) {
		res.status(400).json({
			success: false,
			message: "Required fields are missing"
		});
	}
	/**
	 * colour?
	 */
	// date validation
	if (!isValidDate(plan_startDate) || !isValidDate(plan_endDate)) {
		//fail
		return res.status(400).json({
			success: false,
			message: "Date values provide are invalid"
		});
	} else if (isDateAfter(plan_startDate, plan_endDate)) {
		//fail
		return res.status(400).json({
			success: false,
			message: "Start Date after end date"
		});
	}

	//check if app exists
	try {
		let [val] = await pool.execute(
			"select exists(select 1 from application where app_acronym = ?) as app_exists",
			[plan_app_acronym]
		);
		if (!val[0].app_exists) {
			return res.status(400).json({
				success: false,
				message: "No such Application found"
			});
		} else {
			// find the names of plans for the app
			// check if new name is contained in the list
			let [val] = await pool.execute(
				"select exists(select 1 from plan where Plan_app_Acronym = ? and plan_MVP_name = ?) as plan_exists",
				[plan_app_acronym, plan_name]
			);
			if (val[0].plan_exists) {
				return res.status(401).json({
					success: false,
					message:
						"A plan with the same name already exists under this application"
				});
			}
		}
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Error doing application validation"
		});
	}

	if (colour) {
		//check for 6 characters only hexadec
		const hexColorRegex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
		if (!hexColorRegex.test(colour)) {
			return res.status(400).json({
				success: false,
				message: "Invalid colour code"
			});
		} else {
			colour = colour.substring(1);
		}
	}

	// the final insert
	try {
		await pool.execute(
			"insert into `plan` (`plan_app_acronym`, `plan_MVP_name`, `plan_startDate`, `plan_endDate`, `plan_colour` ) values (?,?,?,?,?)",
			[plan_app_acronym, plan_name, plan_startDate, plan_endDate, colour]
		);
		res.status(200).json({
			success: true
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Error inserting plan"
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
