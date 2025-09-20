const mongoose = require("mongoose");

const serialNumberSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  productName: {
    type: String,
  },
  serialNumber: {
    type: String,
    unique: false,
  },
  serialNumberId: {
    type: Number,
    unique: true,
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supplier",
  },
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transaction",
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
  },
  siteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ApiKey",
  },
  supplierName: {
    type: String,
  },
  activationLimit: {
    type: Number,
    required: true,
  },
  activationGuide: {
    type: String,
  },
  activationCode: {
    type: String,
  },
  validity: {
    type: String, // Define validity as a String type
  },
  purchaseDate: {
    type: Date,
  },
  warrantyDate: {
    type: Date,
  },
  expiresAt: {
    type: Date,
  },
  // New fields to track status
  status: {
    type: String,
    enum: ["available", "expired", "sold"],
    default: "available",
  },
  isDeliverred: {
    type: Boolean,
    default: false,
  },
  soldAt: {
    type: Date,
  },
  type: {
    type: String,
    enum: ["single", "volume"],
    required: true,
  },
},
{
  timestamps: true,
  versionKey: false
});

serialNumberSchema.pre("save", async function (next) {
  if (!this.isNew) {
    return next();
  }
  try {
    const maxSerialNumber = await SerialNumber.findOne()
      .sort({ serialNumberId: -1 })
      .exec();
    if (maxSerialNumber) {
      this.serialNumberId = maxSerialNumber.serialNumberId + 1;
    } else {
      this.serialNumberId = 1;
    }
    next();
  } catch (err) {
    console.log(err);
    return next(err);
  }
});

const SerialNumber = mongoose.model("SerialNumber", serialNumberSchema);

module.exports = SerialNumber;
