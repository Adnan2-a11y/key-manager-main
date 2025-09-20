const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const authenticateToken = require("../middleware/authToken");
const checkUserRole = require("../middleware/roleAccessControl");

router.use(authenticateToken);
router.use(checkUserRole(["admin", "manager"]));

router.get("/all", productController.show);
router.get("/stocks", productController.stocks);
router.get("/get-all", productController.getAll); // paginated products
router.get("/stocks-all", productController.stocksAll);

router.get("/details/", productController.product_details);

router.post("/add", productController.add);
router.post("/edit", productController.edit);

router.patch("/edit", productController.edit);

router.delete("/delete", productController.delete);

module.exports = router;
