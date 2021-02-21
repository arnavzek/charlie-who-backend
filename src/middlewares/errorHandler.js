function errorHandler(err, req, res, next) {
  let error;
  if (typeof err == "string") {
    error = { message: err };
  } else {
    error = err;
  }
  res.status(400);
  console.error("error handler triggered", error);
  global.errors.push(err.message);
  res.json({ error: error.message });
}

module.exports = errorHandler;
