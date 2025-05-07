const pool = require("../db/connect");
const { StatusCodes } = require("http-status-codes");
const { UserError, BadRequestError, NotFoundError } = require("../errors");

const getAccount = async (req, res) => {
  const userId = req.params.id;
  if(!userId) {
    throw new BadRequestError("User ID not provided");
  }
  const user = await pool.query(
    "SELECT user_email,user_name FROM users WHERE user_id = $1",
    [userId]
  );
  if(user.rows.length === 0) {
    throw new NotFoundError("User not found");
  }
  let email = user.rows[0].user_email;
  let name = user.rows[0].user_name;
  res.status(StatusCodes.OK).json({ email, name });
};

const updateAccount = async (req, res) => {
  const userId = req.params.id;
  const { email, name } = req.body;

  if(!userId) {
    throw new BadRequestError("User ID not provided");
  }
  
  const fields = [];
  const values = [];

  // Check for email and ensure it's unique
  if (email) {
    const user = await pool.query("SELECT * FROM users WHERE user_email = $1", [
      email,
    ]);
    if (user.rows.length !== 0) {
      throw new UserError("Email already exists");
    }
    fields.push("user_email = $" + (fields.length + 1));
    values.push(email);
  }

  // Check for name
  if (name) {
    fields.push("user_name = $" + (fields.length + 1));
    values.push(name);
  }

  // If no fields to update, throw an error
  if (fields.length === 0) {
    throw new BadRequestError("No fields to update");
  }

  // Add userId as the last parameter
  values.push(userId);
  const query = `UPDATE users SET ${fields.join(", ")} WHERE user_id = $${
    values.length
  } RETURNING *`;

  // Execute the update query
  const acc = await pool.query(query, values);

  // Return success response
  res.status(StatusCodes.OK).json(acc.rows[0]);
};

const addOrder = async (req, res) => {
  const { user_id, data, total, address, name, phone } = req.body;
  
  // Validate required fields
  if (!user_id || !data || !address || !name || !phone || !total) {
    throw new BadRequestError("Missing required fields");
  }

  const result = await pool.query(
    `INSERT INTO orders (user_id, data, total, address, name, phone)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [user_id, JSON.stringify(data), total, address, name, phone]
  );

  res.status(StatusCodes.CREATED).json(result.rows[0]);
};

const getOrders = async (req, res) => {
  const { id } = req.params;
  const { status } = req.query;

  if (!id || !status) {
    throw new BadRequestError("User ID and status are required");
  }

  const result = await pool.query(
    `SELECT * FROM orders WHERE user_id = $1 AND order_status = $2`,
    [id, status]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError("No orders found");
  }

  res.status(StatusCodes.OK).json(result.rows);
};

module.exports = {
  getAccount,
  updateAccount,
  addOrder,
  getOrders,
};
