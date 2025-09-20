const mongoose = require("mongoose");

const saleRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  invoice_no: {
    type: Number,
  },
  customer: {
    first_name: {
      type: String,
    },
    last_name: {
      type: String,
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
      default: "",
    },
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    zip: {
      type: String,
    },
    country: {
      type: String,
    },
  },
  products: [
    {
      product_id: {
        type: Number,
      },
      variation_id: {
        type: Number,
        default: 0,
      },
      product_name: {
        type: String,
      },
      quantity: {
        type: Number,
      },
      origin_product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product", // Refers to Product model
      },
    },
  ],
  date_sold: {
    type: Date,
    default: Date.now,
  },
});

const SaleRecord = mongoose.model("SaleRecord", saleRecordSchema);

module.exports = SaleRecord;
