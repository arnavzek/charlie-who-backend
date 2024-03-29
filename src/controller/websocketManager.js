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

      if (!global.emptyRooms[roomID] && !global.filledRooms[roomID]) {
        global.emptyRooms[roomID] = {
          members: {},
          private: true,
          imitator: null,
        };
      }

      let room = global.emptyRooms[roomID];
      if (!room) return socket.emit("error-message", "Room is completely full");

      room.members[peerID] = { socket };

      try {
        socket.join(roomID);
      } catch (e) {
        console.log("[error]", "join room :", e);
        socket.emit("error", "couldnt join room");
      }

      if (room.imitator) socket.emit("imitator-selected", room.imitator);
      socket.to(roomID).broadcast.emit("user-connected", peerID);

      if (Object.keys(room.members).length >= 2) {
        assignimitator(room);
      }

      if (Object.keys(room.members).length >= 5) {
        global.filledRooms[roomID] = room;
        delete global.emptyRooms[roomID];
      }

      socket.on("leave-room", () => {
        onDisconnect();
        try {
          socket.leave(roomID);
        } catch (e) {
          console.log("[error]", "leave room :", e);
          socket.emit("error", "couldnt leave room");
        }
      });

      socket.on("declare-winner", (winningPeerID) => {
        if (peerID !== room.imitator) return;
        socket.to(roomID).broadcast.emit("winner-declared", winningPeerID);
        room.imitator = null;
        assignimitator(room, winningPeerID);
      });

      function onDisconnect() {
        socket.to(roomID).broadcast.emit("user-disconnected", peerID);
        let room2 = null;
        if (global.emptyRooms[roomID]) {
          room2 = global.emptyRooms[roomID];
          delete global.emptyRooms[roomID].members[peerID];
        } else {
          if (global.filledRooms[roomID]) {
            delete global.filledRooms[roomID].members[peerID];
            room2 = global.filledRooms[roomID];
            global.emptyRooms[roomID] = room2;
            delete global.filledRooms[roomID];
          }
        }

        if (!room2) return;

        if (room2.imitator == peerID) {
          socket.to(roomID).broadcast.emit("imitator-disconnected");
          room2.imitator = null;
        }

        assignimitator(room2);
      }

      socket.on("disconnect", onDisconnect);

      function assignimitator(roomObject, pickedUserPeerID) {
        if (roomObject.imitator === null) {
          let peerIDs = Object.keys(roomObject.members);
          let numberOfMembers = peerIDs.length;
          if (!numberOfMembers)
            return socket.emit(
              "error-message",
              "0 member, can't choose immitator"
            );
          if (!pickedUserPeerID) {
            let userToPick = getRandomNumber(numberOfMembers - 1);
            pickedUserPeerID = peerIDs[userToPick];
          }
          roomObject.imitator = pickedUserPeerID;

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
