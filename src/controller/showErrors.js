global.errors = [];

function showErros(req, res, next) {
  if (global.errors.length == 0) return res.send("Site is healthy");
  res.json({ errors: global.errors });
}

module.exports = showErros;
