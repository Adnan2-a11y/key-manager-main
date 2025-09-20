const express = require("express");
const router = express.Router();
const stockController = require("../controllers/stockController");
const authenticateToken = require("../middleware/authToken");
const checkUserRole = require("../middleware/roleAccessControl");

router.use(authenticateToken);
router.use(checkUserRole("admin" || "manager"));

router.get("/stock", stockController.getAllStocks);
router.get("/stock/:productId", stockController.getStockForProduct);

module.exports = router;
