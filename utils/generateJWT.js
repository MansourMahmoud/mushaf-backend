const jwt = require("jsonwebtoken");

module.exports = async (payload) => {
  // generate JWT token
  const token = await jwt.sign(payload, process.env.JWT_SECRET_KEY);
  return token;
};
