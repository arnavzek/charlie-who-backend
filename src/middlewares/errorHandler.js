function errorHandler(err, req, res, next) {
  let error;
  if (typeof err == "string") {
    error = { message: err };
  } else {
    error = err;
  }
  res.status(400);
  console.log("error handler triggered", error);
  res.json({ error: error.message });
}

module.exports = errorHandler;
