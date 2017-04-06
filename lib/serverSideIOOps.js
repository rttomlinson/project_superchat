const chatOps = require('./chatOps');


let injectedOps = io => {
    
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
}

return injectedOps;


