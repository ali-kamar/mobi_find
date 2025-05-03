const { StatusCodes } = require("http-status-codes");
const CustomAPIError = require("./custom-api");

class UserError extends CustomAPIError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.CONFLICT;
  }
}

module.exports = UserError;
