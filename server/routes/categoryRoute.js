const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authToken");
const checkUserRole = require("../middleware/roleAccessControl");
const categoryController = require("../controllers/categoryController");

router.use(authenticateToken);
router.use(checkUserRole(["admin", "manager"]));

router.get("/categories", categoryController.show_category);
router.get("/cats", categoryController.getAllCategories);
router.post("/category/add", categoryController.add_category);

router.patch("/category/edit", categoryController.edit_category);

router.delete("/category/delete", categoryController.delete_category);

module.exports = router;
