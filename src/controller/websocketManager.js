function websocketManager(app) {
  const server = require("http").Server(app);
  const io = require("socket.io")(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("join-room", (roomID, peerID) => {
      if (!peerID) return socket.emit("error-message", "peerID missing");
      if (!roomID) return socket.emit("error-message", "roomID missing");

      let room = global.emptyRooms[roomID];
      if (!room) return socket.emit("error-message", "Invalid roomID");

      room.members[peerID] = { socket };
      socket.join(roomID);
      if (room.imitator) socket.emit("imitator-selected", peerID);
      socket.to(roomID).broadcast.emit("user-connected", peerID);

      if (Object.keys(room.members).length >= 2) {
        assignimitator(room);
      }

      if (Object.keys(room.members).length >= 5) {
        global.filledRooms[roomID] = room;
        delete global.emptyRooms[roomID];
      }

      socket.on("disconnect", () => {
        socket.to(roomID).broadcast.emit("user-disconnected", peerID);
        let room = null;
        if (global.emptyRooms[roomID]) {
          room = global.emptyRooms[roomID];
          delete global.emptyRooms[roomID].members[peerID];
        } else {
          if (global.filledRooms[roomID]) {
            delete global.filledRooms[roomID].members[peerID];
            room = global.filledRooms[roomID];
            global.emptyRooms[roomID] = room;
            delete global.filledRooms[roomID];
          }
        }

        if (!room) return;

        if (room.imitator == peerID) {
          socket.to(roomID).broadcast.emit("imitator-disconnected");
          room.imitator = null;
        }

        assignimitator(room);
      });

      function assignimitator(roomObject) {
        if (roomObject.imitator === null) {
          let peerIDs = Object.keys(roomObject.members);
          let numberOfMembers = peerIDs.length;
          if (!numberOfMembers)
            return socket.emit(
              "error-message",
              "0 member, can't choose immitator"
            );
          let userToPick = getRandomNumber(numberOfMembers - 1);
          let pickedUserPeerID = peerIDs[userToPick];
          roomObject.imitator = pickedUserPeerID;
          console.log("found an imitator", peerIDs, userToPick);
          socket.emit("imitator-selected", pickedUserPeerID);
          socket
            .to(roomID)
            .broadcast.emit("imitator-selected", pickedUserPeerID);
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
