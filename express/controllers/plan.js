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
	let [plan_app_acronym] = req.body;

	try {
		let [val] = await pool.execute(
			"select exists (select 1 from application where app_acronym = ?) as app_exists",
			[plan_app_acronym]
		);
		if (!val[0].app_exists) {
			res.status(400).json({
				success: false,
				message: "No such Application found"
			});
		}
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Error doing application validation"
		});
	}

	try {
		let [val] = await pool.query(
			"select Plan_MVP_name, colour from plan where plan_app_acronym = ?",
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

	//date validation
	if (
		isValidDate(plan_startDate) &&
		isValidDate(plan_endDate) &&
		!isDateAfter(plan_startDate, plan_endDate)
	) {
	} else {
		//fail
		res.status(400).json({
			success: false,
			message: "Date values provided are invalid"
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
			"update users set plan_startDate = ?, plan_endDate = ?, plan_colour = ? where plan_MVP_name = ? ",
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

// What to do for change state

/**
 * Create plan
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.createPlan = async (req, res, next) => {
	let { plan_name, plan_startDate, plan_endDate, plan_app_acronym, colour } =
		req.body;

	if (!plan_name || !plan_app_acronym || !plan_startDate || !plan_endDate) {
		res.status(400).json({
			success: false,
			message: "Required fields are missing"
		});
	}
	/**
	 * colour?
	 */
	//date validation
	if (
		isValidDate(plan_startDate) &&
		isValidDate(plan_endDate) &&
		!isDateAfter(plan_startDate, plan_endDate)
	) {
	} else {
		//fail
		res.status(400).json({
			success: false,
			message: "Date values provided are invalid"
		});
	}

	//check if app exists
	try {
		let [val] = await pool.execute(
			"select exists(select 1 from application where app_acronym = ?) as app_exists",
			[plan_app_acronym]
		);
		if (!val[0].app_exists) {
			res.status(400).json({
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
		res.status(500).json({
			success: false,
			message: "Error doing application validation"
		});
	}

	if (colour) {
		//check for 6 characters only hexadec
	}

	// the final insert
	try {
		let [val] = await pool.execute(
			"insert into `plan` (`plan_app_acronym`, `plan_MVP_name`, `plan_startDate`, `plan_endDate`, `plan_colour` ) values (?,?,?,?,?)",
			[plan_app_acronym, plan_name, plan_startDate, plan_endDate, colour]
		);
		res.status.json({
			success: true
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Error inserting plan"
		});
	}
};
