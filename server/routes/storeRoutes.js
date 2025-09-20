const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authToken");
const checkUserRole = require("../middleware/roleAccessControl");
const storeController = require("../controllers/storeController");
const telegramBotController = require("../controllers/telegramBotController");

router.use(authenticateToken);
router.use(checkUserRole(["admin", "manager", "user"]));

router.post("/incoming/orders", storeController.newOrder);
router.post("/updating/orders", storeController.updateOrderAndGetKey);
router.post("/notify/order/status", storeController.getOrderStatus);
router.get("/store-list", storeController.getAllStores);
router.post("/notify-test", telegramBotController.notifyTest);
router.get("/stock-notify-test", telegramBotController.stockNotifyTest);
router.get("/getStoreById/:id", storeController.getStoreById);
router.get("/startSync", storeController.startSync);

module.exports = router;