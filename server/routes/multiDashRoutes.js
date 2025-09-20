const express = require("express");
const router = express.Router();
const multiDashController = require("../controllers/multiDashController");
const authenticateToken = require("../middleware/authToken");
const checkUserRole = require("../middleware/roleAccessControl");

router.use(authenticateToken);

router.get("/summary", multiDashController.summary);

module.exports = router;