const express = require("express");
const router = express.Router();
const serialNumberController = require("../controllers/serialNumberController");
const authenticateToken = require("../middleware/authToken");
const checkUserRole = require("../middleware/roleAccessControl");

router.use(authenticateToken);
router.use(checkUserRole(["admin", "manager"]));

router.get("/", serialNumberController.getAll);
router.post("/add", serialNumberController.add);
router.get("/view/:id", serialNumberController.view);
router.post("/edit/:id", serialNumberController.edit);
router.get("/filter", serialNumberController.filterByProduct);
router.get("/stock-list", serialNumberController.stockList);
router.get("/stock-by-product/:id", serialNumberController.stockByProduct);
router.delete("/delete", serialNumberController.delete);
router.delete("/delete-many", serialNumberController.bulkDelete);
router.post("/update/:id", serialNumberController.updateShopOrderV2);

module.exports = router;
