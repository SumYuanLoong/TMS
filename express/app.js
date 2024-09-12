require("dotenv").config();
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
/**
 * parameter pollution
 *
 */
// const clean = require('xss-clean');

let ErrorObj = require("./utils/errorHandler");
var usersRouter = require("./routes/users");
var authRouter = require("./routes/auth");
var groupsRouter = require("./routes/group");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));
app.use(helmet());
app.use(
	cors({
		origin: "http://localhost:5173"
	})
);

app.use("/users", usersRouter);
app.use("/groups", groupsRouter);
app.use("/auth", authRouter);

app.all("*", (req, res, next) => {
	next(new ErrorObj(`${req.url} route not found`, 404, ""));
});

app.use(ErrorObj);

console.log("app has started up");

module.exports = app;
