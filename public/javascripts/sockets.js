$(document).ready(function() {
  var ___currentRoom = "default";

  var getCookies = function() {
    var pairs = document.cookie.split(";");
    var cookies = {};
    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i].split("=");
      cookies[pair[0].trim()] = unescape(pair[1]).trim();
    }
    return cookies;
  };
  var theCookies = getCookies();

  //setting the username at top of screen
  $("#user-heading").text(theCookies.user);
  
  
  //Remove hidden class from logout button
  $('#logout').removeClass('hidden');
  

  var currentUrl = $(location).attr("href");
  console.log(location);
  var socket = io.connect(currentUrl);
  socket.on("connection", data => {
    console.log("We got connected!");
    console.log(`data is ${data}`);
    //Set current room to default
    $(".currentRoom").text("Default");

    $("#messages tbody").html(data.messages);

    //get the data
    //populate the webpage
    //data.rooms is an array
    //forEach
    $("#rooms tbody").html(data.rooms);
  });

  socket.on("new room", stringOHTML => {
    //create new tr element from data from server

    //find the rooms table
    //and append it to the end of the table
    $("#rooms tbody").prepend(stringOHTML);
  });

  $("#newRoom").submit(event => {
    event.preventDefault();
    let newRoom = $("#chatroomID").val();
    socket.emit("new room", newRoom);
    $(".currentRoom").text(newRoom);
    return false;
  });

  socket.on("new message", data => {
    console.log(`data is ${data}`);
    if (data.room === ___currentRoom) {
      $("#messages tbody").prepend(data.htmlString);
    } else {
      $(`#${data.room}`).parents("td").addClass("warning");
    }
  });

  $("#newMessage").submit(event => {
    event.preventDefault();
    let message = $("#message").val().trim();
    let user = theCookies.user || "Anon"; //Some function to get usersName
    let room = ___currentRoom || "default"; //Some function
    //name of user and name of current chatroom
    socket.emit("new message", { message, user, room });
    return false;
  });

  $("#rooms").on("click", "div.room-name", event => {
    let newSelection = $(event.currentTarget)
      .parents("td")
      .removeClass("warning");
    //emit roomchange event to server
    socket.emit("room-change", event.currentTarget.id);
    ___currentRoom = event.currentTarget.id;
    //update current room on page
    $(".currentRoom").text(___currentRoom);
  });

  socket.on("room-change", data => {
    $("#messages tbody").html(data.messages);
  });

  $("#logout").click(event => {
    event.preventDefault();
    document.cookie += "=;expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    window.location = "/";
  });
});
