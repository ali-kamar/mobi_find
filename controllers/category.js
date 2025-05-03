const pool = require("../db/connect");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");

const getAllCategories = async (req, res) => {
  const categories = await pool.query("SELECT * FROM categories");

  res.status(StatusCodes.OK).json(categories.rows)
  
}


const addCategory = async (req, res) => {
  const { categoryName } = req.body;

  // Check if the category already exists
  const existingCategory = await pool.query(
    "SELECT * FROM categories WHERE category_name ILIKE $1",
    [categoryName]
  );

  if (existingCategory.rows.length > 0) {
    throw new BadRequestError("Category already exists");
  }

  // Insert new category
  const updatedCategoryName =
    categoryName.charAt(0).toUpperCase() + categoryName.slice(1).toLowerCase();

  const newCategory = await pool.query(
    "INSERT INTO categories (category_name) VALUES ($1) RETURNING *",
    [updatedCategoryName]
  );

  res.status(StatusCodes.CREATED).json(newCategory.rows[0]);
};

const editCategory = async (req, res) => {
  const { id } = req.params;
  const { categoryName } = req.body;

  if (!id || !categoryName) {
    throw new BadRequestError("No values provided");
  }

  // Check if the category exists
  const category = await pool.query(
    "SELECT * FROM categories WHERE category_id = $1",
    [id]
  );

  if (category.rows.length === 0) {
    throw new NotFoundError("Category not found");
  }

  // Check if the new category name already exists
  const existingCategory = await pool.query(
    "SELECT * FROM categories WHERE category_name ILIKE $1 AND category_id != $2",
    [categoryName, id]
  );

  if (existingCategory.rows.length > 0) {
    throw new BadRequestError("Category already exists");
  }

  // Update the category name
  const updatedCategoryName =
    categoryName.charAt(0).toUpperCase() + categoryName.slice(1).toLowerCase();

    
  const updatedCategory = await pool.query(
    "UPDATE categories SET category_name = $1 WHERE category_id = $2 RETURNING *",
    [updatedCategoryName, id]
  );

  res.status(StatusCodes.OK).json(updatedCategory.rows[0]);
};

const deleteCategory = async (req, res) => {

    const { id } = req.params;

    // Check if the category exists
    const category = await pool.query(
      "SELECT * FROM categories WHERE category_id = $1",
      [id]
    );

    if (category.rows.length === 0) {
      throw new NotFoundError("Category not found");
    }

    // Delete the category
    const deleteCategory = await pool.query("DELETE FROM categories WHERE category_id = $1", [id]);

    res.status(StatusCodes.OK).json({ message: "Category deleted successfully." });

};

module.exports = {
  addCategory,
  editCategory,
  deleteCategory,
  getAllCategories,
};
