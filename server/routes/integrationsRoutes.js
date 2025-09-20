const express = require("express");
const router = express.Router();
const integrationController = require("../controllers/integrationController");
router.post("/connect-store-callback", integrationController.saveStoreKeys);
const authenticateToken = require("../middleware/authToken");
const checkUserRole = require("../middleware/roleAccessControl");


router.use(authenticateToken);
router.use(checkUserRole(["admin", "manager", "user"]));

router.post("/create", integrationController.generateApiKey);
router.post("/delete", integrationController.deleteApiKey);
router.get("/api-key/:id", integrationController.viewApiKeyById);
router.get("/list", integrationController.viewAllApiKey);
router.patch("/update/:id", integrationController.changeApiKeyStatus);
router.post("/connect-store", integrationController.connectStore);
router.get("/start-sync", integrationController.startSync);
router.get("/start-sync-only", integrationController.fetchSingleEndpoint);
router.get("/sync-status", integrationController.syncStatus);


module.exports = router;