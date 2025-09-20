const Product = require("../database/product/productDB");
const SerialNumber = require("../database/product/serialNumberDb");
const stockController = {
  getStockForProduct: async (req, res) => {
    try {
      const productId = req.params.productId;

      // Fetch the product
      const product = await Product.findById(productId);
      if (!product)
        return res.status(404).json({ message: "Product not found" });

      // Count available serial numbers for the product
      const availableSerialsCount = await SerialNumber.countDocuments({
        productId,
        status: "available",
      });

      res.status(200).json({
        productId: product._id,
        productName: product.productName,
        availableSerialsCount,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getAllStocks: async (req, res) => {
    try {
      // Fetch all products
      const products = await Product.find();

      // Map through each product and count available serial numbers
      const stockList = await Promise.all(
        products.map(async (product) => {
          const availableSerialsCount = await SerialNumber.countDocuments({
            productId: product._id,
            status: "available", // Assuming 'available' is the status for serial numbers in stock
          });

          // Return product data with available serials count
          return {
            productId: product._id,
            productName: product.productName,
            availableSerialsCount,
          };
        })
      );

      // Return the stock list as a response
      res.status(200).json(stockList);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};

module.exports = stockController;
