const Supplier = require("../database/supplierDb");

const supplierController = {
  add: async (req, res) => {
    try {
      const supplierData = req.body;
      const newSupplier = new Supplier(supplierData);
      await newSupplier.save();
      console.log("A supplier has been added successfully.");
      res
        .status(201)
        .json({ message: "Supplier added successfully", newSupplier });
    } catch (err) {
      res.status(400).json({ message: "Error adding supplier", err });
    }
  },

  getAll: async (req, res) => {
    try {
      const suppliers = await Supplier.find();
      res.status(200).json({ suppliers });
    } catch (err) {
      res.status(500).json({ message: "Error retrieving suppliers", err });
    }
  },

  edit: async (req, res) => {
    try {
      const id = req.query.id;

      const updateSupplierData = req.body;
      const updateSupplier = await Supplier.findByIdAndUpdate(
        id,
        updateSupplierData,
        { new: true }
      );
      if (!updateSupplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      res
        .status(200)
        .json({ message: "Supplier updated successfully", updateSupplier });
    } catch (err) {
      res.status(500).json({ message: "Error updating supplier", err });
    }
  },

  delete: async (req, res) => {
    try {
      const id = req.query.id;
      const deleteSupplier = await Supplier.findByIdAndDelete(id);
      if (!deleteSupplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      res.status(200).json({ message: "Supplier deleted successfully." });
    } catch (err) {
      res.status(500).json({ message: "Error deleting supplier", err });
    }
  },
};

module.exports = supplierController;
