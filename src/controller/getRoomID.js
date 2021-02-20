global.emptyRooms = {};
global.filledRooms = {};
global.roomsIDs = [];

function getRoomID(req, res, next) {
  let roomID = null;
  let countryNamespace = emptyRooms[req.geo.country];

  if (!emptyRooms[req.geo.country]) {
    generateNewRoom();
  } else {
    let emptyRooms = Object.keys(countryNamespace);
    if (emptyRooms.length == 0) return generateNewRoom();
    roomID = Object.keys(countryNamespace)[0];
  }

  res.json({ roomID });

  function generateNewRoom() {
    roomID = generateRoomID();
    countryNamespace[roomID] = {
      members: 0,
      immitatorID: null,
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
