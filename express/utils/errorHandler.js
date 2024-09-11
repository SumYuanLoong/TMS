const ErrorMessage = require("./errorMessage");

/**
 *  This module will process all the custom errors raised by
 * the ErrorMessage class. Crafts a appropriate response for the user
 */
module.exports = (err, req, res, next) => {
	err.statusCode = err.statusCode || 500;

	let error = { ...err };
	error.message = err.message;
	res.status(error.statusCode).json({
		errorCode: error.code || 123,
		success: false,
		message: error.message || "Internal Server Error."
	});
};
