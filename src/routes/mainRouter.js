let express = require("express");
let router = express.Router();
let getRoomID = require("../controller/getRoomID");
let showErrors = require("../controller/showErrors");

router.get("/get-room-id", getRoomID);
router.get("/", showErrors);
module.exports = router;
