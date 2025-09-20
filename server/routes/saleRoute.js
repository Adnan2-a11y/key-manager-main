const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authToken");
const checkUserRole = require("../middleware/roleAccessControl");
const saleController = require("../controllers/saleController");

router.use(authenticateToken);

router.post("/create", saleController.createSell);

module.exports = router;
