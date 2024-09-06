const pool = require("../utils/db");

/**
 * To use prepared statements, use pool.execute('query', [data,'data'])
 * This will internally call prepare and query seperately
 */
exports.getAllUser = async (req, res) => {
	try {
		let [val, fields] = await pool.query("Select * from users");
		console.log(val);
		res.send(val);
	} catch (err) {
		console.error(err);
	}
};
exports.getOneUser = async (req, res) => {
	try {
		let [val, fields] = await pool.execute(
			`Select * from users where 'username' = ?`,[req.username]
		);
		console.log(val);
		return val;
	} catch (err) {
		console.error(err);
	}
};
