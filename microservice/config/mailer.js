const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
	host: "smtp.ethereal.email",
	port: 587,
	auth: {
		user: process.env.MAIL_user,
		pass: process.env.MAIL_pass
	}
});

module.exports = transporter;
