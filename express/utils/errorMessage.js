class ErrorMessage extends Error {
	/**
	 *
	 * @param {string} message
	 * @param {int} statusCode http codes
	 * @param {string} errorCode standardised errorcodes
	 */
	constructor(message, statusCode, errorCode) {
		super(message);
		this.statusCode = statusCode;
		this.errorCode = errorCode;

		Error.captureStackTrace(this, this.constructor);
	}
}

module.exports = ErrorMessage;
