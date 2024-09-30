const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
	host: "smtp.ethereal.email",
	port: 587,
	auth: {
		user: "carol21@ethereal.email",
		pass: "pBEAgcrEeK6hYNQhmQ"
	}
});

module.exports = transporter;
