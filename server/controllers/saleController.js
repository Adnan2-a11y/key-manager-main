const SaleRecord = require("../database/product/saleDB");
const SerialNumber = require("../database/product/serialNumberDb");

const saleController = {
  createSell: async (req, res) => {
    try {
      const userId = req.user._id;
      const { invoice_no, customer, products } = req.body;

      const newSaleRecord = new SaleRecord({
        userId,
        invoice_no,
        customer,
        products,
      });

      const savedSaleRecord = await newSaleRecord.save();

      // Collect serial numbers to return
      const keysToReturn = [];

      // Loop through each product to get and update serial numbers
      for (const product of products) {
        // Find serial numbers for the current product
        const serialNumbers = await SerialNumber.find({
          productId: product.origin_product_id,
          status: "available",
        }).limit(product.quantity); // Limit by the quantity requested

        // Prepare keys array for the current product
        const productKeys = serialNumbers.map((serial) => serial.serialNumber);

        // Update each serial number to mark as sold
        for (const serial of serialNumbers) {
          serial.status = "sold";
          serial.soldAt = new Date(); // Set the sold date
          await serial.save();
        }

        // Add the updated serial numbers to the response list
        keysToReturn.push({
          product_id: product.product_id,
          product_name: product.product_name,
          quantity: product.quantity,
          origin_product_id: product.origin_product_id,
          keys: productKeys,
        });
      }

      res.status(201).json({
        invoice_no: savedSaleRecord.invoice_no,
        keys: keysToReturn,
      });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Failed to create sell record", error: err.message });
    }
  },
};

module.exports = saleController;
