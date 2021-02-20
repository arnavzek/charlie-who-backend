let express = require("express");
let router = express.Router();
let getRoomID = require("../controller/getRoomID");

router.get("/get-room-id", getRoomID);

module.exports = router;
