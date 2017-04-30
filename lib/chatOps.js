const redisOps = require("./redisOps");

let chatOps = {};

chatOps.makeNewRoom = async function makeNewRoom(roomName) {
  //Unknown if it makes it into the list
  if (await redisOps.createChatRoom(roomName)) {
    let newRoom = chatOps.makeRoomHTML(roomName);
    return newRoom;
  } else {
    return false;
  }
};

chatOps.buildMessageTable = async function buildMessageTable(roomName) {
  let messageList = await redisOps.getNamesOfMessagesByChatRoom(roomName);
  let listOfObjects = await redisOps.lookupMessagesAndJSONParse(messageList);
  let HTMLstring = "";
  listOfObjects.forEach(obj => {
    HTMLstring += chatOps.makeMessageHTML(obj);
  });
  return HTMLstring;
};

chatOps.buildRoomsTable = async function buildRoomsTable() {
  let listOfNames = await redisOps.getAllChatRooms();
  console.log(`listOfNames is a ${listOfNames}`);
  let HTMLstring = "";
  listOfNames.forEach(name => {
    HTMLstring += chatOps.makeRoomHTML(name);
  });

  return HTMLstring;
};

chatOps.makeRoomHTML = function makeRoomHTML(roomName) {
  let htmlString = `<tr><td><a><div class="room-name" id="${roomName}">${roomName}</div></a></td></tr>`;
  return htmlString;
};

chatOps.makeNewMessage = function makeNewMessage(messageObj) {
  redisOps.createMessage(messageObj);
  return chatOps.makeMessageHTML(messageObj);
};
chatOps.makeMessageHTML = function makeMessageHTML(messageObj) {
  let htmlString = `<tr><td>Username ${messageObj.user}<br>${messageObj.message}</td></tr>`;
  return htmlString;
};


module.exports = chatOps;
