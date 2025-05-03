const express = require("express");

const router = express.Router();

const { register, login, checkAdmin } = require("../controllers/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/check-admin", checkAdmin);

module.exports = router;
