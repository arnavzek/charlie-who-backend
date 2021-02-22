global.emptyRooms = {};
global.filledRooms = {};
global.roomsIDs = [];

function getRoomID(req, res, next) {
  let roomID = null;
  if (req.private) {
    generateNewRoom();
  } else {
    req.private = false;
  }

  if (!Object.keys(global.emptyRooms).length) {
    generateNewRoom();
  } else {
    findRoom();
  }

  function findRoom(index) {
    if (!index) index = 0;
    let emptyRoomIDs = Object.keys(global.emptyRooms);
    if (index > emptyRoomIDs.length - 1) return generateNewRoom();
    roomID = emptyRoomIDs[index];
    if (global.emptyRooms[roomID].private) return findRoom(index + 1);
    res.json({ roomID });
  }

  function generateNewRoom() {
    roomID = generateRoomID();
    global.emptyRooms[roomID] = {
      members: {},
      private: req.private,
      immitatorUserID: null,
    };

    res.json({ roomID });
  }
}

function generateRoomID(length) {
  if (!length) length = 4;
  let newRoomID = Math.round(Math.random() * Math.pow(10, length));
  if (roomsIDs.includes(newRoomID)) return generateRoomID(length++);
  roomsIDs.push(newRoomID);
  return newRoomID;
}

module.exports = getRoomID;
