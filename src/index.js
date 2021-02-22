const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const errorHandler = require("./middlewares/errorHandler");
const mainRouter = require("./routes/mainRouter");
const websocketManager = require("./controller/websocketManager");

let corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(morgan("tiny"));
app.use(express.json());
websocketManager(app);
app.use(mainRouter);
app.use(errorHandler);

process.on("uncaughtException", (err) => {
  console.log(err.message);
  global.errors.push(err.message);
  console.error("Asynchronous error caught.", err);
});

process.on("unhandledRejection", (err) => {
  console.log(err.message);
  global.errors.push(err.message);
  console.error("Asynchronous error caught.", err);
});
