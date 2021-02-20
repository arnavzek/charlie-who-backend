var geoip = require("geoip-country");

function attachCountryName(req, res, next) {
  let ip = parseIp(req);
  if (!ip) {
    req.geo = { country: "annonymus" };
    return next();
  }
  req.geo = geoip.lookup(ip);
  next();
}

function parseIp(req) {
  return (
    (typeof req.headers["x-forwarded-for"] === "string" &&
      req.headers["x-forwarded-for"].split(",").shift()) ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.connection?.socket?.remoteAddress
  );
}

module.exports = attachCountryName;
