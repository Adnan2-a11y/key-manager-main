const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authToken");
const checkUserRole = require("../middleware/roleAccessControl");
const roleController = require("../controllers/roleController");


router.use(authenticateToken);
router.use(checkUserRole(["admin", "manager"]));

router.get("/all", roleController.getRoles);
router.get("/view/:id", roleController.getRole);
router.post("/add", roleController.createRole);
router.patch("/update", roleController.editRole);
router.delete("/delete", roleController.deleteRole);

module.exports = router;