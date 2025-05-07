const pool = require("../db/connect");
const { UnauthenticatedError, BadRequestError } = require("../errors");

const checkAdmin = async (req, res, next) => {
  try {
    const id = req.user;
    
    if (!id) {
      throw new BadRequestError("ID not provided");
    }
    const admin = await pool.query(
      "SELECT user_role from users WHERE user_id = $1",
      [id]
    );

    if (admin.rows[0].user_role === "user") {
      throw new UnauthenticatedError("Not an admin");
    }

    req.admin = true;
    next();
  } catch (error) {    
    next(error);
  }
};

module.exports = checkAdmin;
