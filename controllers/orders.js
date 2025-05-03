const pool = require("../db/connect");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");

const getOrders = async (req, res) => {
  const { status } = req.query;

  if (!status) {
    throw new BadRequestError("Status is required");
  }

  const result = await pool.query(
    `SELECT * FROM orders WHERE order_status = $1`,
    [status]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError("No orders found");
  }

  res.status(StatusCodes.OK).json(result.rows);
};

const editOrder = async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  if (!status || !id) {
    throw new BadRequestError("Status and id are required");
  }

  const result = await pool.query(
    "UPDATE orders SET order_status = $1 WHERE order_id = $2 RETURNING *",
    [status, id]
  );

  res.status(StatusCodes.OK).json(result.rows[0]);
};

const deleteOrder = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new BadRequestError("Status and id are required");
  }

  const result = await pool.query(
    "DELETE FROM orders WHERE order_id = $1 RETURNING *",
    [id]
  );

  res.status(StatusCodes.OK).json(result.rows[0]);
};

module.exports = { getOrders, editOrder, deleteOrder };
