const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productName: {
    type: String, // Corrected type to String
    required: true,
  },
  productId: {
    type: Number,
    unique: true,
  },
  dynamicUrl: {
    type: String,
  },
  purchasePrice: {
    type: Number,
  },
  regularPrice: {
    type: Number,
  },
  sellPrice: {
    type: Number,
  },
  productType: {
    type: String,
  },
  longDescription: {
    type: String,
  },
  shortDescription: {
    type: String,
  },
  tag: {
    type: String,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category", // Reference to the Category model
  },
  productImg: {
    type: String,
  },
  galleryImages: [
    {
      type: String, // Array of image URLs for the product gallery
    },
  ],
  permission: {
    type: String,
  },
  created_by: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

productSchema.pre("save", async function (next) {
  if (!this.isNew) {
    return next();
  }
  try {
    const maxProduct = await Product.findOne().sort({ productId: -1 }).exec();
    if (maxProduct) {
      this.productId = maxProduct.productId + 1;
    } else {
      this.productId = 1;
    }
    next();
  } catch (err) {
    console.log(err);
    return next(err);
  }
});

// Define Product model
const Product = mongoose.model("Product", productSchema);

// Define pre-save hook for auto-incrementing productId

module.exports = Product;
