let express = require("express");
let router = express.Router();
let apiRouter = require("./apiRouter");
let showErrors = require("../controller/showErrors");

router.use("/api/v1", apiRouter);
router.get("/", showErrors);
module.exports = router;
