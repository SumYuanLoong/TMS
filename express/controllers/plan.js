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
	let [app] = req.body;

	try {
		let [val] = await pool.query(
			"select Plan_MVP_name, colour from plan where plan_app_acronym = ?",
			[app]
		);
		res.status(200).json({
			success: true,
			planList: val
		});
	} catch (error) {
		console.log("error getting the apps");
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
exports.updatePlan = async (req, res, next) => {};

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

	if (
		!plan_name ||
		!plan_app_acronym ||
		!colour ||
		!plan_startDate ||
		!plan_endDate
	) {
		return next("Required fields are missing");
	}
	//I wanna sleep so bad
	/**
	 * Plan name needs to be unique within an app
	 * date validation
	 * app_name validation
	 * colour?
	 */

	try {
		let [val] = await pool.execute(
			"select app_acronym from application where app_acronym = ?",
			[plan_app_acronym]
		);
		if (val.length == 0) {
		}
	} catch (error) {
		console.log("yeah I have no idea what the fk is wrong anymore");
	}

	if (colour) {
		return next("R_number provided is not a whole number");
	}

	try {
		let [val] = await pool.execute(
			"insert into `plan` (`plan_app_acronym`, `plan_MVP_name`, `plan_startDate`, `plan_endDate`, `plan_colour` ) values (?,?,?,?,?)",
			[plan_app_acronym, plan_name, plan_startDate, plan_endDate, colour]
		);
		res.status.json({
			success: true
		});
	} catch (error) {
		return next("error with insertion");
	}
};
