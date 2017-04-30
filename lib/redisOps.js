const redisClient = require("./redisClient");
const shortid = require("shortid");



//************ Initialize Database ****************//////
redisClient.flushall();
redisClient.lpush("rooms", "default");
//Grab the default room and pull from it?

let messageID = "message" + Date.now();
redisClient.setnx(
  messageID,
  JSON.stringify({
    user: "welcome",
    message: "welcome to default",
    room: "default"
  })
);
//Add this newly created message to the default's field in the rooms key
redisClient.lpush("default", messageID);
///////********* End database Initialization *********/////////


async function createChatRoom(roomName) {
  //check if roomName already exists
  //if so, we should tell user somewhere
  //if not, add it
  if (roomName === "") {
    console.log("Can't be an empty string");
  }
  if (await checkIfRoomExists(roomName)) {
    return false;
  } else {
    //call lrange and count the entries
    await redisClient.lpushAsync("rooms", roomName);
    // check if the value returned from lpush is 1 greater than lrange count
    return true;
  }
}

async function checkIfRoomExists(roomName) {
  let namesOfRooms = await redisClient.lrangeAsync("rooms", 0, -1);
  //see if roomNames is in namesOfRooms
  return namesOfRooms.some(element => element == roomName);
}

function getChatRoomMessages(roomName) {
  getChatRoom(roomName).then(
    data => {
      return data;
    },
    err => {
      return err;
    }
  );
}

function getChatRoom(roomName) {
  return redisClient.hgetAsync("rooms", roomName);
}

function getAllChatRooms() {
  return redisClient.lrangeAsync("rooms", 0, -1);
}

/* Returns an array of strings corresponding to the unique ID
of the messages
@params roomName {String} name of room
*/
function getNamesOfMessagesByChatRoom(roomName) {
  return new Promise((resolve, reject) => {
    redisClient.lrange(roomName, 0, -1, (err, arr) => {
      if (err) {
        reject(err);
      }
      resolve(arr);
    });
  });
}

//loop through the array
//redisClient.get(messageName)
//JSON parse the data we get back
//data will be an object with properties user, room, message
//Make an array of these objects and pass it back
function lookupMessagesAndJSONParse(arrOfMessageNames) {
  return Promise.all(
    arrOfMessageNames.map(item => {
      return redisClient.getAsync(item).then(result => {
        return JSON.parse(result);
      });
    })
  );
}

function _getAllOfHash(hash) {
  return new Promise((resolve, reject) => {
    redisClient.hgetall(hash, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
}

function createMessage(messageObj) {
  let messageID = "message" + shortid.generate();
  redisClient.lpushAsync(messageObj.room, messageID);
  messageObj = JSON.stringify(messageObj);
  redisClient.setAsync(messageID, messageObj);
}

module.exports = {
  createChatRoom,
  getChatRoom,
  getChatRoomMessages,
  getAllChatRooms,
  createMessage,
  getNamesOfMessagesByChatRoom,
  lookupMessagesAndJSONParse
};
