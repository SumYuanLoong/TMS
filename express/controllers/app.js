/**
 * App Controller
 */

const pool = require("../utils/db");
var ErrorObj = require("../utils/errorMessage");
const groupC = require("./group");

/**
 * Gets all apps
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.getAllApp = async (req, res, next) => {};

/**
 * Get 1 app
 */
exports.getApp = async (req, res, next) => {};

/**
 * Updates 1 app
 * Pre-req: User has group-level access to manage app
 * @param {string} app_id
 * @param {*} res
 * @param {*} next
 */
exports.updateApp = async (req, res, next) => {};

// What to do for change state

/**
 * Create app
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.createApp = async (req, res, next) => {};
