/**
 * Plan Controller
 */

const pool = require("../utils/db");
var ErrorObj = require("../utils/errorMessage");
const groupC = require("./group");

/**
 * Gets all plans of the Specific app
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.getAllPlan = async (req, res, next) => {};

/**
 * Get 1 plan
 */
exports.getPlan = async (req, res, next) => {};

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
exports.createPlan = async (req, res, next) => {};
