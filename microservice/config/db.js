var mysql = require("mysql2/promise");
require("dotenv").config();

const dbPool = mysql.createPool({
	host: process.env.DB_host,
	user: process.env.DB_user,
	password: process.env.DB_password,
	database: process.env.DB_table
});

module.exports = dbPool;
