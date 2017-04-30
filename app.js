const express = require("express");
const app = express();
const server = require("http").createServer(app);


const path = require("path");
const cookieParser = require("cookie-parser");

//require('./dependencies')(wagner);

require("./lib/serverSideIOOps")(server);

// Set up handlebars
const exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({
    defaultLayout: "main"
}));
app.set("view engine", "handlebars");

// Set up body-parser
app.use(cookieParser());
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
    extended: false
}));

//Require routes
const index = require("./routes/index.js");
app.use(express.static(path.join(__dirname, "public")));
app.use("/socket.io", express.static(__dirname + 'node_modules/socket.io-client/dist/'));
app.use("/", index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error("Not Found");
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render("error");
});

server.listen(process.env.PORT || 3000, () => {
    console.log("starting server");
});
