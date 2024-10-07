var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var taskRouter = require("./routes/task");

const code = {
	auth01: "A001", // invalid username/password
	auth02: "A002", // deactivated
	auth03: "A003", // insufficient group permission
	payload01: "P001", // missing mandatory keys
	payload02: "P002", // invalid values
	payload03: "P003", // value out of range
	payload04: "P004", // task state error
	transaction01: "T001", // error while carrying out transaction
	url01: "U001", // url dont match
	success01: "S001", // success
	error01: "E001" // general error
};

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/task", taskRouter);

app.use((req, res) => {
	console.log("test1");
	res.status(408).json({ code: "U001" });
});

module.exports = app;
