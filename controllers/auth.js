const pool = require("../db/connect");
const { StatusCodes } = require("http-status-codes");
const bcrypt = require("bcrypt");
const {
  UserError,
  UnauthenticatedError,
  CustomAPIError,
  BadRequestError,
} = require("../errors");
const jwtGenerator = require("../utils/jwtGenerator");

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const user = await pool.query("SELECT * FROM users WHERE user_email = $1", [
    email,
  ]);

  if (user.rows.length !== 0) {
    throw new UserError("user already exists");
  }

  if (password.length < 6) {
    throw new CustomAPIError("Password must be more than 6 digits");
  }

  const saltRound = 10;
  const salt = await bcrypt.genSalt(saltRound);

  const bcryptPassword = await bcrypt.hash(password, salt);

  const newUser = await pool.query(
    "INSERT INTO users (user_name,user_email,user_password) VALUES ($1,$2,$3) RETURNING *",
    [name, email, bcryptPassword]
  );

  const token = jwtGenerator(newUser.rows[0].user_id);

  res.status(StatusCodes.CREATED).json({
    token,
    user_id: newUser.rows[0].user_id,
    role: newUser.rows[0].user_role,
  });
};

const login = async (req, res) => {
  // 1. destructure req.body
  const { email, password } = req.body;

  // 2. check if user exists
  const user = await pool.query("SELECT * FROM users WHERE user_email = $1", [
    email,
  ]);

  if (user.rows.length === 0) {
    throw new UnauthenticatedError("password or email is incorrect");
  }

  // 3. check if incoming password is the same as the database password
  const validPassword = await bcrypt.compare(
    password,
    user.rows[0].user_password
  );

  if (!validPassword) {
    throw new UnauthenticatedError("password or email is incorrect");
  }

  // 4. asign a jwt token
  let user_id = user.rows[0].user_id;
  let role = user.rows[0].user_role;
  const token = jwtGenerator(user_id);

  res.status(StatusCodes.OK).json({ token, user_id, role });
};

const checkAdmin = async (req, res) => {
  const { id } = req.body;
  if (!id) {
    throw new BadRequestError("ID not provided");
  }
  const admin = await pool.query("SELECT user_role from users WHERE user_id = $1", [id]);

  if(admin.rows[0].user_role === "user"){
    throw new UnauthenticatedError("Not an admin");
  }

  res.status(StatusCodes.OK).json(admin.rows[0]);
  
  
};

module.exports = { register, login, checkAdmin };
