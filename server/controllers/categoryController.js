const Category = require("../database/product/categoryDb");
const Product = require("../database/product/productDB");
const { uploadCategoryImg } = require("../utils/multerConfig");
const path = require("path");
const slugify = require("slugify");

const categoryController = {
  show_category: async (req, res) => {
    try {
      const categories = await Category.aggregate([
        {
          $lookup: {
            from: "products", // Assuming your products collection name is "products"
            localField: "_id",
            foreignField: "category", //category is the field in the products collection referencing the category
            as: "products",
          },
        },
        {
          $lookup: {
            from: "categories", // Assuming your categories collection name is "categories"
            localField: "parentCategory",
            foreignField: "_id",
            as: "parentCategory",
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            slug: 1, // Include the slug field
            description: 1,
            thumbnail: 1,
            parentCategory: 1,
            productCount: { $size: "$products" }, // Count the number of products for each category
          },
        },
        {
          $unwind: {
            path: "$parentCategory",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $sort: { name: 1 }, // Sort by product count in ascending order
        },
      ]);

      console.log(`::-> Showing total categories: ${categories.length}`);

      return res.status(200).json({
        success: true,
        categories,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  add_category: async (req, res) => {
    try {
      uploadCategoryImg.single("categoryImage")(req, res, async (err) => {
        if (err) {
          return res
            .status(200)
            .json({ success: false, error: "Category image upload failed" });
        }

        const { name, slug, parentCategory, description } = req.body;

        const generateSlugFromName = (name) => {
          return slugify(name, { replacement: "-", lower: true });
        };

        // Handle slug
        let finalSlug = slug || "";

        if (!finalSlug) {
          finalSlug = generateSlugFromName(name);
        } else {
          // If slug is provided, strip spaces from the slug
          finalSlug = finalSlug.replace(/\s/g, "");
        }

        const parentCategoryId = parentCategory ? parentCategory : null;
        const categoryImgUrl = req.file ? req.file.path : "";

        const existingCategory = await Category.findOne({ slug: finalSlug });
        if (existingCategory) {
          return res
            .status(200)
            .json({ success: false, message: "A category with the same name already exists" });
        }

        const newCategory = new Category({
          name,
          slug: finalSlug,
          description,
          parentCategory: parentCategoryId,
          thumbnail: categoryImgUrl,
        });

        // Save the new category to the database
        await newCategory.save();

        // Respond with success message
        console.log(`::-> Added new category: ${newCategory.name}`);
        res.status(200).json({ success: true, message: "Category added successfully" });
      });
    } catch (error) {
      // Handle errors
      console.log(error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  edit_category: async (req, res) => {
    try {
      uploadCategoryImg.single("categoryImage")(req, res, async (err) => {
        if (err) {
          return res
            .status(400)
            .json({ error: "Category image upload failed" });
        }

        const { id, name, slug, parentCategory, description } = req.body;
        let categoryImgUrl;
        if (req.file) {
          categoryImgUrl = req.file.path;
        }

        // Fetch the category from the database
        const category = await Category.findById(id);

        // Check if the category exists
        if (!category) {
          return res.status(404).json({ error: "Category not found" });
        }

        // Update the category data
        category.name = name;
        category.slug = slug;
        category.parentCategory = parentCategory;
        category.description = description;
        

        if (categoryImgUrl) {
          category.thumbnail = categoryImgUrl;
        }

        await category.save();

        res
          .status(200)
          .json({ success: true, message: "Category updated successfully" });
      });
    } catch (err) {
        res.status(200).json({ success: false, message: err.message });
    }
  },

  delete_category: async (req, res) => {
    try {
      const categoryId = req.query.id;

      const category = await Category.findById(categoryId);

      if (!category) {
        console.log("::-> Category not found");
        return res.status(404).json({ error: "Category not found" });
      }

      // Get the parent ID if exists
      const newParentId = category.parentCategory?._id || null;

      // Reassign children
      await Category.updateMany(
        { 'parentCategory': category._id },
        {
          $set: {
            parentCategory: newParentId,
          },
        }
      );

      // Find the category by ID and delete it
      const deletedCategory = await Category.findByIdAndDelete(categoryId);

      if (!deletedCategory) {
        return res.status(200).json({ success: false, message: `Category not found with ID ${category._id}` });
      }

      console.log(`::-> Deleted Category successfully: '${category.name}'`);

      // Respond with success message
      res.status(200).json({ success: true, message: `Category ${category.name} deleted, children reassigned.` });
    } catch (error) {
      console.log(error);
      res.status(200).json({ success: false, message: error.message });
    }
  },

  getAllCategories: async (req = '', res = '') => {
    try {
      if (req?.query?.cat) {
        const category = await Category.findOne({ slug: req.query.cat });
        if (!category) {
          return res ? res.status(404).json({ message: 'Category not found' }) : { message: 'Category not found' };
        }
        
        const children = await Category.find({ parentCategory: category._id});


        if (!children || children.length === 0) {
          // const products = await Product.find({ category: category._id });
          const products = await Product.aggregate([
            {
              $match: {
                category: category._id
              }
            },            
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
          return res ? res.status(200).json({ success: true, products }) : { success: true, title: category.name, products: products };
        }

        return res ? res.status(200).json({ success: true, categories: children }) : { success: true, categories: children };
      }else{
        const categories = await Category.find({ 
          $or: [
            { parentCategory: { $exists: false } },
            { parentCategory: null }
          ]
        });
        return res ? res.status(200).json({ success: true, categories }) : { success: true, categories };
      }
    } catch (error) {
      console.log(error);
      return res ? res.status(200).json({ success: false, message: error.message }) : { success: false, message: error.message };
    }
  },
};

module.exports = categoryController;
