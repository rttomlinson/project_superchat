const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const path = require("path");
const cookieParser = require("cookie-parser");
const chatOps = require("./lib/chatOps");
const wagner = require("wagner-core");

require("./dependencies")(wagner);
//require("./serversideIOOps")(io)
require("./lib/serverSideIOOps")(io);




//Require routes
const index = require("./routes/index.js")(io);

// Set up handlebars
const exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Set up body-parser
app.use(cookieParser());
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));

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

/////////////////////
io.on("connection", client => {
  console.log("New connection!");
  //send the client the data
  //display all message of the default chatroom
  let pro = Promise.all([
    chatOps.buildMessageTable("default"),
    chatOps.buildRoomsTable()
  ]);
  pro.then(function onFulfilled(infoObj) {
    client.emit("connection", { messages: infoObj[0], rooms: infoObj[1] });
  });

  client.on("new room", room => {
    //io.emit(new room) tells all the clients to update their rooms
    let pro = chatOps.makeNewRoom(room);
    pro.then(htmlString => {
      if (htmlString) {
        io.emit("new room", htmlString);
      }
    });
  });
  client.on("new message", data => {
    //io.emit(new room) tells all the clients to update their rooms
    let htmlString = chatOps.makeNewMessage(data);
    if (htmlString) {
      let room = data.room;
      io.emit("new message", { htmlString, room });
    }
  });

  client.on("room-change", room => {
    chatOps.buildMessageTable(room).then(function onFulfilled(messages) {
      client.emit("room-change", { messages });
    });
  });
});

server.listen(process.env.PORT || 3000);
