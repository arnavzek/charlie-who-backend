function websocketManager(app) {
  const server = require("http").Server(app);
  const io = require("socket.io")(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("join-room", (roomID, userID) => {
      if (!global.emptyRooms[roomID])
        return socket.emit(
          "error-message",
          "Room is houseful, try another room"
        );

      let room = global.emptyRooms[roomID];
      room.members[userID] = socket;

      if (Object.keys(room.members).length >= 2) {
        assignImmitator(room);
      }

      if (Object.keys(room.members).length >= 5) {
        global.filledRooms[roomID] = room;
        delete global.emptyRooms[roomID];
      }

      socket.join(roomID);
      socket.to(roomID).broadcast.emit("user-connected", userID);

      socket.on("disconnect", () => {
        socket.to(roomID).broadcast.emit("user-disconnected", userID);
        let room = null;
        if (global.emptyRooms[roomID]) {
          room = global.emptyRooms[roomID].members[userID];
          delete global.emptyRooms[roomID].members[userID];
        } else {
          if (global.filledRooms[roomID]) {
            delete global.filledRooms[roomID].members[userID];
            room = global.filledRooms[roomID];
            global.emptyRooms[roomID] = room;
            delete global.filledRooms[roomID];
          }
        }

        if (room.immitatorUserID == userID) {
          room.immitatorUserID = null;
        }

        assignImmitator(room);
      });

      function assignImmitator(roomObject) {
        if (roomObject.immitatorUserID === null) {
          let userIDs = Object.keys(roomObject.members);
          let numberOfMembers = userIDs.length;
          let userToPick = getRandomNumber(numberOfMembers - 1);
          let userToPick_userID = userIDs[userToPick];
          roomObject.immitatorUserID = userToPick_userID;
          socket.to(roomID).emit("immitatorUserID", userToPick_userID);
        }
      }
    });
  });

  const port = process.env.PORT ? process.env.PORT : 8080;
  server.listen(port, appStarted);

  function appStarted(err) {
    console.log("App started on port: http://localhost:" + port);
  }
}

function getRandomNumber(maxValue) {
  return Math.round(Math.random() * maxValue);
}

module.exports = websocketManager;
