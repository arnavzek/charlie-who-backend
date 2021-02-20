const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const errorHandler = require("./middlewares/errorHandler");
const mainRouter = require("./routes/mainRouter");
const attachCountryName = require("./middlewares/attachCountryName");
const websocketManager = require("./controller/websocketManager");
let corsOptions = { credentials: true };
const port = process.env.PORT ? process.env.PORT : 8080;

app.use(cors(corsOptions));
app.use(morgan("tiny"));
app.use(express.json());
app.use(attachCountryName);
app.use(mainRouter);
app.use(errorHandler);

websocketManager(app);
app.listen(port, appStarted);

function appStarted(err) {
  console.log("App started on port: http://localhost:" + port);
}

process.on("uncaughtException", (err) => {
  console.log(err.message);
  console.error("Asynchronous error caught.", err);
});

process.on("unhandledRejection", (err) => {
  console.log(err.message);
  console.error("Asynchronous error caught.", err);
});
