function websocketManager(app) {
  const server = require("http").Server(app);
  const io = require("socket.io")(server);

  io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId) => {
      socket.join(roomId);
      socket.to(roomId).broadcast.emit("user-connected", userId);

      socket.on("disconnect", () => {
        socket.to(roomId).broadcast.emit("user-disconnected", userId);
      });
    });
  });
}

module.exports = websocketManager;
