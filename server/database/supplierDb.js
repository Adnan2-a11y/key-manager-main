const mongoose = require("mongoose");
const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
  website: {
    type: String,
  },
  paymentMethod: {
    type: String,
  },
});

const Supplier = mongoose.model("Supplier", supplierSchema);
module.exports = Supplier;
