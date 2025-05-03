const express = require("express");

const router = express.Router();

const {
  getAccount,
  updateAccount,
  addOrder,
  getOrders,
} = require("../controllers/user");

router.route("/account/:id").get(getAccount).patch(updateAccount);
router.route("/orders/add-order").post(addOrder);
router.route("/orders/:id").get(getOrders);

module.exports = router