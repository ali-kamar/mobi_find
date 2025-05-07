const express = require("express");

const router = express.Router();

const { getAllProducts, getProduct } = require("../controllers/product");
const {getAllCategories} = require("../controllers/category")

router.route("/product").get(getAllProducts);
router.route("/product/:id").get(getProduct);
router.route("/category").get(getAllCategories);

module.exports = router
