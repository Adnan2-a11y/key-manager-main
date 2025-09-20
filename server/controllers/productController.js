const Product = require("../database/product/productDB");
const Category = require("../database/product/categoryDb");

const { uploadproductImg } = require("../utils/multerConfig");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

const productController = {
  add: async (req, res) => {
    try {
      uploadproductImg.single("productImg")(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ error: "Product image upload failed" });
        }

        let productImgUrl = null;

        if (req.file) {
          productImgUrl = req.file.path;
        }

        const {
          productName,
          dynamicUrl,
          shortDescription,
          longDescription,
          purchasePrice,
          regularPrice,
          sellPrice,
          category,
          productType,
          permission,
          created_by,
        } = req.body;

        const existingProduct = await Product.findOne({
          productName: productName,
        });

        if (existingProduct) {
          return res
            .status(200)
            .json({ success: false,message: "A product with the same name already exists" });
        }

        const productCategory = category ? category : null;

        const newProduct = new Product({
          productName,
          dynamicUrl,
          purchasePrice,
          shortDescription,
          longDescription,
          regularPrice,
          sellPrice,
          productType,
          category: productCategory,
          permission,
          created_by,
        });

        await newProduct.save();

        res
          .status(200)
          .json({ success: true, message: "Product added successfully", product: newProduct });
      });
    } catch (error) {
      res
        .status(200)
        .json({ success: false, message: error.message });
    }
  },

  show: async (req, res) => {
    try {
      const keyword = req.query.keyword; 
      const { limit, search = keyword, category, page} = req.query

      let query = {};

      // If a keyword is provided, construct a case-insensitive regular expression
      // to match any part of the product name or description
      if (search) {
        const regex = new RegExp(search, "i");
        query.productName = { $regex: regex };
      }

      if (category) {
        query.category = category;
      }

      // Find products that match the query
      const [total, products] = await Promise.all([
        Product.find(query).countDocuments(),
        Product.find(query)
          .populate("category", "name")
          .limit(limit)
          .skip((page - 1) * limit)
          .sort({ productName: 1 })
      ])
      // const products = await Product.find(query).populate("category", "name").limit(limit).skip((page - 1) * limit);

      // If no products match the query and no keyword is provided, return a message
      if (!products || (products.length === 0 && !keyword)) {
        return res.status(200).json({ message: "No products found" });
      }

      // Return the products
      return res.status(200).json({
        success: true,
        counts: total,
        products,
      });
    } catch (err) {
      // Handle errors
      res.status(500).json({ message: err.message });
    }
  },

  getAll: async (req, res) => {
    try {
      const keyword = req.query.keyword; 
      const { limit, search = keyword, category, page} = req.query

      const regex = new RegExp(search, "i");
      const l = Number(limit) || 10;
      const p = Number(page) || 1;

      const skip = (p - 1) * l;
      const catId = category && mongoose.isObjectIdOrHexString(category) ? mongoose.Types.ObjectId.createFromHexString(category) : null;

      const matchConditions = [];
      if (regex) {
        matchConditions.push({ productName: { $regex: regex } });
      }
      
      if (catId) {
        // Check if the category is a parent category or a child category
        const childCategories = await Category.find({ parentCategory: catId }).select("_id");
        if (childCategories.length > 0) {
          const childCategoryIds = childCategories.map((cat) => cat._id);
          matchConditions.push({ category: { $in: [catId, ...childCategoryIds] } });
        }else{
          matchConditions.push({ category: catId });
        }
      }

      const matchStage = matchConditions.length
        ? { $match: { $and: matchConditions } }
        : { $match: {}
      };

      const products = await Product.aggregate([
        matchStage,
        {
          $lookup: {
            from: "serialnumbers",
            localField: "_id",
            foreignField: "productId",
            as: "keys"
          }
        },
        {
          $addFields: {
            soldKeys: {
              $size: {
                $filter: {
                  input: "$keys",
                  as: "key",
                  cond: { $eq: ["$$key.status", "sold"] }
                }
              }
            },
            availableKeys: {
              $size: {
                $filter: {
                  input: "$keys",
                  as: "key",
                  cond: { $eq: ["$$key.status", "available"] }
                }
              }
            }
          }
        },
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "category",
          }
        },
        {
          $unwind: {
            path: "$category",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $facet: {
            data: [
              { $skip: skip },
              { $limit: l },
              {
                $project: {
                  _id: 1,
                  availableKeys: 1,
                  category: 1,
                  createdAt: 1,
                  dynamicUrl: 1,
                  galleryImages: 1,
                  permission: 1,
                  productId: 1,
                  productImg: 1,
                  productName: 1,
                  productType: 1,
                  purchasePrice: 1,
                  regularPrice: 1,
                  sellPrice: 1,
                  soldKeys: 1,
                  category: {
                    _id: 1,
                    name: 1,
                    slug: 1,
                  },

                }
              },
            ],
            totalCount: [
              { $count: "count" }
            ]
          }
        },
        {
          $project: {
            data: 1,
            totalCount: { $arrayElemAt: ["$totalCount.count", 0] }
          }
        }
        
        
      ]);
      // console.log("::-> stockAll API called by:", req.headers['cb-platform'] || 'localhost', products[0].totalCount);
    
      return res.status(200).json({
        success: true,
        products: products[0].data,
        counts: products[0].totalCount,
      });
    } catch (err) {
      console.log("::-> getAll API error:", err.message);
      res.status(500).json({ message: err.message });
    }
  },
  
  stocks: async (req, res) => {
    try {
      // const {limit: pageSize = 10, page = 1, search} = req.query; // Get the keyword from the query parameters
      const { limit: pageSize = 10, category, page = 1, search} = req.query

      // If a keyword is provided, construct a case-insensitive regular expression
      // to match any part of the product name or description
      // if (search) {
      //   const regex = new RegExp(search, "i");
      //   query = { productName: { $regex: regex } };
      // }

      // Find products that match the query
      // const products = await Product.find(query).populate("category", "name");

      const l = Number(pageSize) || 10;
      const p = Number(page) || 1;



      const skip = (p - 1) * l;
      const catId = category && mongoose.isObjectIdOrHexString(category) ? mongoose.Types.ObjectId.createFromHexString(category) : null;
      const matchConditions = [];
      
      const regex = new RegExp(search, "i");
      if (regex) {
        matchConditions.push({ productName: { $regex: regex } });
      }
      if (catId) {
        // Check if the category is a parent category or a child category
        const childCategories = await Category.find({ parentCategory: catId }).select("_id");
        if (childCategories.length > 0) {
          const childCategoryIds = childCategories.map((cat) => cat._id);
          matchConditions.push({ category: { $in: [catId, ...childCategoryIds] } });
        }else{
          matchConditions.push({ category: catId });
        }
      }

      const matchStage = matchConditions.length
        ? { $match: { $and: matchConditions } }
        : { $match: {}
      };

      const products = await Product.aggregate([
        matchStage,
        {
          $lookup: {
            from: "serialnumbers",
            localField: "_id",
            foreignField: "productId",
            as: "keys"
          }
        },
        {
          $addFields: {
            soldKeys: {
              $size: {
                $filter: {
                  input: "$keys",
                  as: "key",
                  cond: { $eq: ["$$key.status", "sold"] }
                }
              }
            },
            availableKeys: {
              $size: {
                $filter: {
                  input: "$keys",
                  as: "key",
                  cond: { $eq: ["$$key.status", "available"] }
                }
              }
            }
          }
        },
        {
          $project: {
            _id: 1,
            productName: 1,
            soldKeys: 1,
            availableKeys: 1
          }
        },
        {
          $sort: {
            soldKeys: -1 // Sort by available keys in descending order
          }
        },
        {
          $facet: {
            counts: [{ $count: "count" }], // মোট প্রোডাক্ট সংখ্যা গণনা
            paginatedResults: [
              { $skip: (page - 1) * Number(pageSize) },
              { $limit: Number(pageSize) }
            ]
          }
        },
        {
          $addFields: {
            count: { $arrayElemAt: ["$counts.count", 0] } // counts.count থেকে সরাসরি মান বের করা
          }
        },
        {
          $project: {
            counts: 0 // পুরনো counts ফিল্ড বাদ দেওয়া
          }
        }
      ]);
    
      // Return the products
      return res.status(200).json({
        success: true,
        counts: products[0].count,
        products: products[0].paginatedResults,
      });
    } catch (err) {
      // Handle errors
      res.status(500).json({ message: err.message });
    }
  },

  stocksAll: async (req, res) => {
    try {
      // Find products that match the query
      // const products = await Product.find(query).populate("category", "name");
      const products = await Product.aggregate([
        {
          $lookup: {
            from: "serialnumbers",
            localField: "_id",
            foreignField: "productId",
            as: "keys"
          }
        },
        {
          $addFields: {
            soldKeys: {
              $size: {
                $filter: {
                  input: "$keys",
                  as: "key",
                  cond: { $eq: ["$$key.status", "sold"] }
                }
              }
            },
            availableKeys: {
              $size: {
                $filter: {
                  input: "$keys",
                  as: "key",
                  cond: { $eq: ["$$key.status", "available"] }
                }
              }
            }
          }
        },
        {
          $project: {
            _id: 1,
            productName: 1,
            sellPrice: 1,
            soldKeys: 1,
            availableKeys: 1,
            productId: 1
          }
        },
        {
          $project: {
            counts: 0 // পুরনো counts ফিল্ড বাদ দেওয়া
          }
        }
      ]);

      // console.log("::-> stockAll API called by:", req.headers['cb-platform'], products);
    
      // Return the products
      return res.status(200).json({
        success: true,
        counts: products.length,
        products: products,
      });
    } catch (err) {
      // Handle errors
      res.status(500).json({ message: err.message });
    }
  },
  lowStocksAll: async () => {
    try {
      const products = await Product.aggregate([
        {
          $lookup: {
            from: "serialnumbers",
            localField: "_id",
            foreignField: "productId",
            as: "keys"
          }
        },
        {
          $addFields: {
            soldKeys: {
              $size: {
                $filter: {
                  input: "$keys",
                  as: "key",
                  cond: { $eq: ["$$key.status", "sold"] }
                }
              }
            },
            availableKeys: {
              $size: {
                $filter: {
                  input: "$keys",
                  as: "key",
                  cond: { $eq: ["$$key.status", "available"] }
                }
              }
            }
          }
        },
        {
          $match: {
            availableKeys: { $lte: 5 } // only products with 5 or fewer available keys
          }
        },
        {
          $project: {
            _id: 1,
            productName: 1,
            sellPrice: 1,
            soldKeys: 1,
            availableKeys: 1,
            productId: 1
          }
        },
        {
          $project: {
            counts: 0 // পুরনো counts ফিল্ড বাদ দেওয়া
          }
        },
        {
          $sort: {
            productName: 1
          }
        }
      ]);

      console.log("::-> lowStocksAll API called by:", 'Daily Cron');
    
      // Return the products
      return {
        success: true,
        counts: products.length,
        products: products,
      };
    } catch (err) {
      // Handle errors
      return { message: err.message };
    }
  },

  product_details: async (req = '', res = '') => {
    const productId = req.query.id;

    try {
      //find the product by ID
      const product = await Product.findById(productId);
      if (!product) {
        return res ? res.status(404).json({ message: "Product not found" }) : { message: "Product not found" };
      }
      return res ? res.json(product) : { product };
    } catch (err) {
      return res ? res.status(500).json({ message: err.message }) : { message: "Product not found" };
    }
  },

  delete: async (req, res) => {
    const productId = req.query.id;

    try {
      // Find the product by ID and delete it
      const deletedProduct = await Product.findByIdAndDelete(productId);

      // If product doesn't exist, return 404
      if (!deletedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Return success message if product is deleted
      res.json({ message: "Product deleted successfully" });
    } catch (err) {
      // Handle errors
      res.status(500).json({ message: err.message });
    }
  },

  edit: async (req, res) => {
    const productId = req.query.id; // Updated data for the product

    try {
      uploadproductImg.single("productImg")(req, res, async (err) => {

        if (err) {
          return res.status(400).json({ error: "Product image upload failed" });
        }
        const initialValues = req.body;
        const updatedData = {
          productName: initialValues.productName || "",
          dynamicUrl: initialValues.dynamicUrl || "",
          sku: initialValues.sku || "",
          shortDescription: initialValues.shortDescription || "",
          longDescription: initialValues.longDescription || "",
          purchasePrice: isNaN(initialValues.purchasePrice) ? 0 : initialValues.purchasePrice,
          regularPrice: isNaN(initialValues.regularPrice) ? 0 : initialValues.regularPrice,
          sellPrice: isNaN(initialValues.sellPrice) ? 0 : initialValues.sellPrice,
          category: initialValues.category || "",
          productType: initialValues.productType || "",
          permission: initialValues.permission || "",
        }

        let productImgUrl = null;

        if (req.file) {
          productImgUrl = req.file.path;
        }

        // Find the product by ID
        let product = await Product.findById(productId);

        // If product doesn't exist, return 404
        if (!product) {
          return res.status(404).json({ message: "Product not found" });
        }

        // If a new image is uploaded, delete the existing image file
        if (productImgUrl && product.productImg) {
          const existingImagePath = path.resolve(product.productImg);

          fs.access(existingImagePath, fs.constants.F_OK, (err) => {
            if (!err) {
              fs.unlink(existingImagePath, (err) => {
                if (err) {
                  console.error(`Failed to delete old image: ${err.message}`);
                }
              });
            }
          });

          // Update the product image field
          product.productImg = productImgUrl;
        }

        // Update only the fields that are present in the request body

        for (const key in updatedData) {
          if (Object.prototype.hasOwnProperty.call(updatedData, key)) {
            product[key] = updatedData[key];
          }
        }

        // Save the updated product
        await product.save();

        // Return the updated product
        res.status(200).json({
          success: true,
          message: "Product updated successfully"
        });
      })
      
    } catch (err) {
      res.status(500).json({ 
        success: false,
        message: err.message,
        error: err
      });
    }
  },
};

module.exports = productController;
