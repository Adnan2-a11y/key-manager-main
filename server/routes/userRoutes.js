const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authenticateToken = require("../middleware/authToken");
const checkUserRole = require("../middleware/roleAccessControl");

router.use(authenticateToken);
router.use(checkUserRole(["admin", "manager"]));

router.get("/all", userController.getAllUser);
router.post("/add", userController.addUser);
router.patch("/update", userController.updateUserProfile);
router.delete("/delete", userController.deleteUser);

router.post("/upload/logo", userController.uploadLogo);
// router.post("/api-key/generate", userController.generateApiKey);

module.exports = router;
