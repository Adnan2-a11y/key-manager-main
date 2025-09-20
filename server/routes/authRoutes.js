const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authenticateToken = require("../middleware/authToken");

router.post("/registration", authController.registration);
router.post("/login", authController.login);
router.get("/verifyToken", authController.verifyToken);

router.post("/logout", authenticateToken, authController.logout);
router.post("/logout-all", authenticateToken, authController.logoutAll);

module.exports = router;
