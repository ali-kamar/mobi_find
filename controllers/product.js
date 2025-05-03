const pool = require("../db/connect");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");

const getAllProducts = async (req, res) => {
  const { category, sort, minPrice, maxPrice, search } = req.query;

  let query = "SELECT * FROM products WHERE 1=1"; // Start with a base query
  const values = [];

  if (category && category !== "") {
    query += " AND category = $1";
    values.push(category);
  }

  if (minPrice && minPrice !== "") {
    query += ` AND price >= $${values.length + 1}`;
    values.push(minPrice);
  }

  if (maxPrice && maxPrice !== "") {
    query += ` AND price <= $${values.length + 1}`;
    values.push(maxPrice);
  }

  if (search && search !== "") {
    query += ` AND name ILIKE $${values.length + 1}`;
    values.push(`%${search}%`); // Use ILIKE for case-insensitive search
  }

  if (sort && sort !== "") {
    query += sort === "asc" ? " ORDER BY price ASC" : " ORDER BY price DESC";
  }

  const products = await pool.query(query, values);

  res.status(StatusCodes.OK).json(products.rows);
};

const getProduct = async (req, res) => {
  const { id } = req.params;

  const product = await pool.query(
    "SELECT * FROM products WHERE product_id = $1",
    [id]
  );

  if (product.rows.length === 0) {
    throw new NotFoundError("No product found");
  }

  res.status(StatusCodes.OK).json(product.rows[0]);
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;

  const deleteProduct = await pool.query(
    "DELETE FROM products WHERE product_id = $1 RETURNING *",
    [id]
  );

  if (deleteProduct.rows.length === 0) {
    throw new NotFoundError("No product found");
  }

  res.status(StatusCodes.OK).json({ msg: "product deleted successfully" });
};

const addProduct = async (req, res) => {
  const { name, description, price, imageURL, category, isAvailable } =
    req.body;

  if (!name || !price || !imageURL || !category) {
    throw new BadRequestError("Missing values");
  }

  const fields = [];
  const values = [];

  // Dynamically populate fields and values based on available data
  if (name) {
    fields.push("name");
    values.push(name);
  }
  if (description !== undefined) {
    fields.push("description");
    values.push(description || null); // Use null if description is an empty string
  }
  if (price) {
    fields.push("price");
    values.push(price);
  }
  if (imageURL) {
    fields.push("imageurl");
    values.push(imageURL);
  }
  if (category) {
    fields.push("category");
    values.push(category);
  }
  if (isAvailable !== undefined) {
    fields.push("isavailable");
    values.push(isAvailable);
  }

  // Construct the query string
  const queryFields = fields.join(", ");
  const queryPlaceholders = fields
    .map((_, index) => `$${index + 1}`)
    .join(", ");
  const query = `INSERT INTO products (${queryFields}) VALUES (${queryPlaceholders}) RETURNING *`;

  const result = await pool.query(query, values);

  res.status(StatusCodes.CREATED).json(result.rows[0]);
};

const editProduct = async (req, res) => {
  const { id } = req.params; // Assuming you're passing the product ID in the URL
  const { name, description, price, imageURL, category, isAvailable, offer } =
    req.body;

  if (!id) {
    throw new BadRequestError("Product ID is required");
  }

  if (!name || !price || !imageURL || !category) {
    throw new BadRequestError("Missing values");
  }

  const fields = [];
  const values = [];

  // Dynamically populate fields and values based on available data
  if (name) {
    fields.push("name");
    values.push(name);
  }
  if (description !== undefined) {
    fields.push("description");
    values.push(description || null); // Use null if description is an empty string
  }
  if (price) {
    fields.push("price");
    values.push(price);
  }
  if (offer) {
    fields.push("offertype");
    values.push(offer);
  }
  if (imageURL) {
    fields.push("imageurl");
    values.push(imageURL);
  }
  if (category) {
    fields.push("category");
    values.push(category);
  }
  if (isAvailable !== undefined) {
    fields.push("isavailable");
    values.push(isAvailable);
  }

  if (fields.length === 0) {
    throw new BadRequestError("No fields provided for update");
  }

  // Construct the query string
  const querySet = fields
    .map((field, index) => `${field} = $${index + 1}`)
    .join(", ");
  values.push(id); // Add the product ID to the values array for the WHERE clause
  const query = `UPDATE products SET ${querySet} WHERE product_id = $${
    fields.length + 1
  } RETURNING *`;

  const result = await pool.query(query, values);

  res.status(StatusCodes.OK).json(result.rows[0]);
};

module.exports = {
  getAllProducts,
  addProduct,
  getProduct,
  deleteProduct,
  editProduct,
};
