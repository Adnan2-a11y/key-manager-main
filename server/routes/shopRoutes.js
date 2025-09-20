const express = require("express");
const router = express.Router();
const shopController = require("../controllers/shopController");
const authenticateToken = require("../middleware/authToken");
const checkUserRole = require("../middleware/roleAccessControl");

router.use(authenticateToken);
router.use(checkUserRole(["admin", "manager", "user"]));

router.post("/new-order", shopController.newOrder);
router.post("/new-order/v2", shopController.newOrderV2);
router.get("/all-orders", shopController.getAllOrders);
router.get("/all-orders-by-site", shopController.getAllOrdersBySiteId);
router.get("/all-orders-by-user", shopController.getAllOrdersByUser);
router.get("/order/view/:id", shopController.viewOrder);
router.delete("/order/delete/:id", shopController.deleteOrder);

module.exports = router;