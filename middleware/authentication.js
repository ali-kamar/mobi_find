const jwt = require("jsonwebtoken");
require("dotenv").config();
const { StatusCodes } = require("http-status-codes");

const authorize = async (req, res, next) => {
  try {
    const jwtToken = req.headers.authorization;

    if (!jwtToken) {
      return res.status(StatusCodes.FORBIDDEN).json("Not Authorized");
    }

    const token = jwtToken.split(" ")[1];

    
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    req.user = payload.user;

    next();
  } catch (error) {
    console.error(error.message);
    return res.status(StatusCodes.FORBIDDEN).json("Not Authorized");
  }
};

module.exports = authorize;
