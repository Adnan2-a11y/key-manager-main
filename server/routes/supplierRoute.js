const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authToken");
const checkUserRole = require("../middleware/roleAccessControl");
const supplierController = require("../controllers/supplierController");

router.use(authenticateToken);
router.use(checkUserRole(["admin", "manager"]));

router.get("/all", supplierController.getAll);
router.post("/add", supplierController.add);
router.post("/edit", supplierController.add);
router.patch("/edit", supplierController.edit);
router.delete("/delete", supplierController.delete);

module.exports = router;
