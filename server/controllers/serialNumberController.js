const SerialNumber = require("../database/product/serialNumberDb");
const { mongoose } = require("mongoose");
const axios = require("axios");
const Transaction = require("../database/transactions");
const shopController = require("./shopController");
const { logToFile } = require("../utils/SaveLogs");
const { sendOrderDataToClient, sendUpdatedOrderDataToClient, determineOrderHasCompleted, sendUpdatedStockDataToClient } = require("../utils/Helper");
const ObjectId = mongoose.Types.ObjectId;

const serialNumberController = {
  add: async (req, res) => {
    try {
      const {
        productId,
        productName,
        serialNumber, // Assuming serialNumbers field contains the bulk serial keys
        activationLimit,
        validity,
        supplierId,
        purchaseDate,
        warrantyDate,
        user,
        activationGuide,
        type,
      } = req.body;

      // Split the serialNumbers string into an array of individual serial keys
      const serialNumberArray = serialNumber
        .split(/\r?\n|,/)
        .filter((serial) => serial.trim() !== "");

      const validityValue = validity || "lifetime";

      const serialNumberInstances = [];

      if (type === "volume") {
        for (const serial of serialNumberArray) {
          for (let j = 0; j < user; j++) {
            const newSerialNumber = new SerialNumber({
              productId,
              productName,
              serialNumber: serial.trim(), // Remove leading/trailing whitespace
              activationLimit,
              validity: validityValue,
              purchaseDate,
              warrantyDate,
              supplierId,
              type,
              activationGuide
            });
            await newSerialNumber.save();
          }
        }
      } else {
        for (const serial of serialNumberArray) {
          const newSerialNumber = new SerialNumber({
            productId: productId,
            productName,
            serialNumber: serial.trim(), // Remove leading/trailing whitespace
            activationLimit,
            validity: validityValue,
            purchaseDate,
            warrantyDate,
            supplierId,
            type,
            activationGuide,
          });
          await newSerialNumber.save();
        }
      }

      res.status(201).json({ message: "Serial numbers added successfully" });
      await sendUpdatedStockDataToClient();
    } catch (error) {
      console.error("Error adding serial numbers:", error);
      res.status(500).json({ message: "Failed to add serial numbers" });
    }
  },

  view: async (req, res) => {
    try {
      const id = req.params.id;
      const serialNumber = await SerialNumber.findById(id).populate("transactionId", "transactionId");
      
      if (!serialNumber) {
        return res
          .status(400)
          .json({ message: `Serial number with this id- ${id} is not found` });
      }
      res.json(serialNumber);
    } catch (err) {
      res.status(500).json({ message: "Error fetching serial number", error: err });
    }
  },

  getAll: async (req, res) => {
    const { limit, search = '', productId, page, status} = req.query
    try {
      
      let matchStage = {};
      // Validate and add productId
      if (productId && /^[a-fA-F0-9]{24}$/.test(productId.trim())) {
        matchStage.productId = new ObjectId(productId.trim());
      } else if (productId) {
        // productId is provided but invalid
        return res.status(400).json({ error: 'Invalid productId format' });
      }

      // Add search if provided
      if (search) {
        matchStage.productName = { $regex: new RegExp(search, 'i') };
      }

      // Add status if provided
      if (status) {
        matchStage.status = status;
      }
      console.log(matchStage);
      // let query = {};
      // if (search) {
      //   const regex = new RegExp(search, "i");
      //   query.productName = { $regex: regex };
      // }

      // if (productId) {
      //   query.productId = productId;
      // }
      
      // if (status){
      //   query.status = status;
      // }
      // const [total, serialNumbers] = await Promise.all([
      //   SerialNumber.find(query).countDocuments(),
      //   SerialNumber.find(query)
      //     .populate("supplierId", "name")
      //     .populate("customerId", "first_name last_name email country")
      //     .populate("transactionId", "transactionId")
      //     .populate("siteId", "name")
      //     .sort({ status: -1, updatedAt: -1 })
      //     .limit(limit)
      //     .skip((page - 1) * limit)
      //     .lean()
      //     .exec(),
      // ]);

      const results = await SerialNumber.aggregate([
        { $match: matchStage },
        // Lookup supplier
        {
          $lookup: {
            from: 'suppliers',
            localField: 'supplierId',
            foreignField: '_id',
            as: 'supplier'
          }
        },
        { $unwind: { path: '$supplier', preserveNullAndEmptyArrays: true } },

        // Lookup customer
        {
          $lookup: {
            from: 'customers',
            localField: 'customerId',
            foreignField: '_id',
            as: 'customer'
          }
        },
        { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },

        // Lookup product
        {
          $lookup: {
            from: 'products',
            localField: 'productId',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },

        // Lookup transaction
        {
          $lookup: {
            from: 'transactions',
            localField: 'transactionId',
            foreignField: '_id',
            as: 'transaction'
          }
        },
        { $unwind: { path: '$transaction', preserveNullAndEmptyArrays: true } },

        // Lookup site
        {
          $lookup: {
            from: 'apikeys',
            localField: 'siteId',
            foreignField: '_id',
            as: 'site'
          }
        },
        { $unwind: { path: '$site', preserveNullAndEmptyArrays: true } },
        // Optional: Project only needed fields
        {
          $project: {
            serialNumberId: 1,
            serialNumber: 1,
            status: 1,
            type: 1,
            purchaseDate: 1,
            warrantyDate: 1,
            createdAt: 1,
            updatedAt: 1,
            supplier: '$supplier.name',
            customer: {
              first_name: '$customer.first_name',
              last_name: '$customer.last_name',
              email: '$customer.email',
              country: '$customer.country'
            },
            product: {
              productName: "$product.productName"
            },
            transaction: {
              invoice_no: "$transaction.invoice_no",
              transactionId: "$transaction.transactionId"
            },            
            site: {
              name: '$site.name'
            }           
          }
        },
        {
          $sort: { status : -1, updatedAt: -1 }
        },
        {
          $facet: {
            data: [
              { $skip: (parseInt(page) - 1) * parseInt(limit) },
              { $limit: parseInt(limit) },
            ],
            count: [
              { $count: "total" }
            ]
          }
        }
      ]);
      console.log("total counts", results);

      const count = results[0].count[0]?.total || 0;
      const data = results[0].data;
      res.status(200).json({ 
        count: count,
        serialNumbers: data
      });
    } catch (err) {
      console.error("Error fetching serial numbers:", err);
      res.status(500).json({ message: "Failed to fetch serial numbers" });
    }
  },

  edit: async (req, res) => {
    
    try {
      const id = req.params.id;
      let transaction = null;
      const serialNumber = await SerialNumber.findById(id).populate('productId');
      if(req.body?.orderNumber) {
        transaction = await Transaction.findOne({transactionId: req.body?.orderNumber});
        
        // If wrong order number
        if(!transaction) {
          return res.status(200).json({ success: false, message: `Order no ${req.body?.orderNumber} is not found` });
        }
      }else{
         if(serialNumber){
           await SerialNumber.updateOne(
             { _id: id },
             { $unset: { siteId: "", customerId: "", transactionId: "" }, $set: { isDeliverred: false} }
           );
         }
      }
      

      if (transaction){
        // match orderdata
        if(transaction?.orderData && transaction?.orderData?.length > 0) {
          transaction?.orderData.map(async (item) => {
            const isProductExistsInMeta = item?.meta_data?._ac_remote_product?.some(product => {
              return product.id.equals(serialNumber.productId._id);
            });

            const isSerialExistsInOrderData = item?.serialKeys?.some(serialKey => {
              return serialKey.serialNumber === serialNumber.serialNumber;
            })

            // if true then push serialkey to serialKeys
            if (isProductExistsInMeta && !isSerialExistsInOrderData) {
              req.body.transactionId = transaction._id;
              req.body.siteId = transaction.siteId;
              req.body.customerId = transaction.customerId;
              req.body.isDeliverred = false;  
            }

            const updateSerialNumber = await SerialNumber.findByIdAndUpdate(
              id,
              req.body,
              { new: true }
            );

            if (updateSerialNumber) {              
                item.serialKeys.push(updateSerialNumber);
                const sellPrice = serialNumber.productId.sellPrice;
                transaction.transactionAmount += parseInt(sellPrice); // adding on main transaction
                transaction.save();
                return res.json({
                  success: true,
                  message: `Serial Number {${updateSerialNumber.serialNumber}} has been updated successfully.`,
                  updateSerialNumber,
              });
            }else{
              return res
                .status(400)
                .json({ 
                  success: false,
                  message: `Serial number with this id- ${id} is not found`
                });
            }            
          });
        }

      }else{
        const result = await SerialNumber.findByIdAndUpdate(
          id,
          req.body,
          { new: true }
        );

        if (!result) {
          return res
            .status(400)
            .json({ 
              success: false,
              message: `Serial number with this id- ${id} is not found` 
            });
        }else{
          res.json({
            success: true,
            message: `Serial Number {${result.serialNumber}} has been updated successfully.`,
            result,
          });
        }
      }
    } catch (err) {
      res.status(500).json({ message: "Error updating serial number", error: err });
    }
  },

  delete: async (req, res) => {
    const id = req.query.id;
    try {
      const deleteSerialNumber = await SerialNumber.findByIdAndDelete(id);
      if (!deleteSerialNumber) {
        return res
          .status(400)
          .json({ message: `Serial number with this id- ${id} is not found` });
      }
      res.json({
        success: true,
        message: `Serial Number {${deleteSerialNumber.serialNumber}} has been deleted successfully.`,
      });
      await sendUpdatedStockDataToClient();
    } catch {
      res.status(500).json({ message: err.message });
    }
  },

  bulkDelete: async (req, res) => {
    const ids = req.query.ids.split(',').map(el => el.trim()).filter(el => el !== '');
    try {
      if (ids.length > 0){
        const result = await SerialNumber.deleteMany({ _id: { $in: ids } });
        
        if (!result) {
          return res
            .status(400)
            .json({ message: `Serial keys not found` });
        }
        res.json({
          message: `{${result.deletedCount}} keys has been deleted successfully.`,
        });
        await sendUpdatedStockDataToClient();
      }else{
        res.json({
          message: `There is no keys provided`,
        });
      }
    } catch {
      res.status(500).json({ message: err.message });
    }
  },

  filterByProduct: async (req, res) => {
    
    try {
      const pid = req.query?.pid ? req.query?.pid.trim() : '';
      if (!pid){
        return res.status(200).json({ message: "Provide Product ID to filter Serial Keys" });
      }
      
      const serialNumbers = await SerialNumber.find({'productId': pid});      

      return res.status(200).json({ 
        count: serialNumbers.length,
        serialNumbers
      });
    } catch (err) {
      console.error("Error fetching serial numbers:", err);
      return res.status(500).json({ message: "Failed to fetch serial numbers" });
    }
  },

  stockList: async (req, res) => {
    try {
      const result = await SerialNumber.aggregate([
        {
          $match: {
            status: "available",
          },
        },
        {
          $group: {
            _id: "$productId",
            count: { $sum: 1 },
          }
        },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "productDetails",
          },
        },
        {
          $unwind: "$productDetails",
        },
        {
          $project: {
            productName: "$productDetails.productName",
            regularPrice: "$productDetails.regularPrice",
            sellPrice: "$productDetails.sellPrice",
            serialKeysCount: "$count",
          },
        },
      ]);      
      return res.status(200).json({ 
        result
      });
    } catch (err) {
      console.error("Error fetching serial numbers:", err);
      return res.status(500).json({ message: "Failed to fetch serial numbers" });
    }
  },

  stockByProduct: async (req, res) => {
    const pid = req.params.id;
    try {
      const result = await SerialNumber.aggregate([
        {
          $match: {
            status: "available",
            productId: new ObjectId(pid), // Use the provided pid
          },
        },
        {
          $group: {
            _id: "$serialNumber",
            count: { $sum: 1 },
          }
        },
        {
          $group: {
            _id: null, // No grouping key to calculate a single total
            total: { $sum: "$count" },
            serialKeys: { $push: { serialNumber: "$_id", count: "$count" } },
          },
        },
        {
          $project: {
            _id: 0, // Exclude the _id field
            total: 1,
            serialKeys: 1,
          },
        },
      ]);      
      return res.status(200).json({ 
        result
      });
    } catch (err) {
      console.error("Error fetching serial numbers:", err);
      return res.status(500).json({ message: "Failed to fetch serial numbers" });
    }
  },

  stockByProductIds: async (allProducts) => {
    try {
      const allProductIds = allProducts.map(el => el.id);
      // console.log(allProductIds);
      // return;
      const counts = await SerialNumber.aggregate([
        {
          $match: {
            status: "available",
            productId: { $in: allProductIds },
          },
        },
        {
          $group: {
            _id: "$productId",
            count: { $sum: 1 },
          }
        },
        {
          $project: {
            _id: 0,
            productId: "$_id",
            count: 1,
          }
        }
      ]);
      
      const fullResult = allProducts.map((item) => {
        const plainItem = item.toObject();
        const found = counts.find(c => c.productId.toString() === plainItem.id.toString());
        return {
          ...plainItem,
          count: found ? found.count : 0
        };
      });
      return fullResult;
    } catch (error){
      console.log(error.message)
      return error.message;
    }
  },

  updateShopOrder: async (req, res) => {
    try {
      const { id } = req.params; // এখানে আমাদের প্রথম প্যারামিটার হলো id
      const { status: transactionStatus } = req.body; // এখানে আমাদের দ্বিতীয় প্যারামিটার হলো status
      
      if (!transactionStatus) {
          return res.status(400).json({ message: "Order status is required" });
      }
      
      // Find the transaction first
      const transaction = await Transaction.findById(id);
      const apiData = await Transaction.findById(id).populate({
        path: "siteId", // এখানে siteId হলো apiKey model এর আইডি
        select: "name webhook_key", // apiKey model থেকে name কে সিলেক্ট করেছি, আরো কিছু সিলেক্ট করতে হবে যেমন webhook authentication key

    });
      
      if (!transaction) {
          return res.status(404).json({ message: "Order not found" });
      }
      
      if (transactionStatus === "complete") {
          try {
              // Run both reissueSerialKey & updateKeyStatus in parallel
              // const [updatedTransaction, isKeyStatusChanged] = await Promise.all([
              //     serialNumberController.reissueSerialKey(transaction),
              //     serialNumberController.updateKeyStatus(transaction)
              // ]);

              const rawdata = await serialNumberController.reissueSerialKey(transaction);
              const updatedTransaction = await serialNumberController.updateKeyStatus(transaction);
      
              if (!rawdata) {
                  return res.status(500).json({ message: "Failed to reissue serial keys" });
              }
      
              if (updatedTransaction) {
                // get callback url from transaction > siteId > apiKey siteurl
                // const siteId = transaction.siteId;
                // const apiKey = transaction.site.apiKey;
                
                

                // const webhookPayload = {
                //   orderId: transaction._id,
                //   invoice_no: transaction.invoice_no,
                //   status: "complete",
                //   data: updatedTransaction.orderData,
                //   updatedAt: new Date(),
                // };
    
                try {
                    const scheme = process.env.NODE_ENV === "production" ? "https" : "http";
                    const siteUrl =  process.env.NODE_ENV === "production" ? apiData.siteId.name : "shop-tic.local";
                    const baseUrl = `${scheme}://${siteUrl}`;
                    
                    await sendOrderDataToClient(updatedTransaction, baseUrl);
                } catch (webhookError) {
                    console.error("Failed to send webhook:", webhookError);
                }

                return res.status(200).json({ 
                    success: true,
                    message: "Order updated successfully",
                    updatedTransaction
                });
              }
          } catch (error) {
              return res.status(500).json({ message: "Error updating transaction", error });
          }
        }else{
          return res.status(200).json({ 
            success: false,
            message: "Order status should be complete to update",
            transaction
          });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
  },

  updateShopOrderV2: async (req, res) => {
    // try {
      const { id } = req.params; // এখানে আমাদের প্রথম প্যারামিটার হলো id
      const { status: transactionStatus } = req.body; // এখানে আমাদের দ্বিতীয় প্যারামিটার হলো status
      
      if (!transactionStatus) {
          return res.status(400).json({ message: "Order status is required" });
      }
      
      // Find the transaction first
      const transaction = await Transaction.findById(id);
      const apiData = await Transaction.findById(id).populate({
        path: "siteId", // এখানে siteId হলো apiKey model এর আইডি
        select: "name webhook_key", // apiKey model থেকে name কে সিলেক্ট করেছি, আরো কিছু সিলেক্ট করতে হবে যেমন webhook authentication key

    });
    
    if (!transaction) {
      return res.status(404).json({ message: "Order not found" });
    }

    // determine if order is fulfilled
    // by checking the ordered item quantity and serialkeys quantity
    



    // Filter all keys from a transaction whose are not deliverred yet!
    const filteredOrderData = transaction.orderData.map(item => ({
      ...item.toObject(),
      serialKeys: item.serialKeys.filter(key => key.isDeliverred !== true)
    }));
    
    // if (!filteredOrderData?.serialKeys && filteredOrderData?.serialKeys === 0 ){
    //   return res.status(200).json({ 
    //     success: false,
    //     message: "There is nothing to do",
    //   });
    // }
    
    const filteredTransaction = {
      ...transaction.toObject(),
      orderData: filteredOrderData
    };
    let countKeys = 0;
    // before sent data to client we need to map product id with each serialKey
    filteredTransaction.orderData = filteredTransaction.orderData.map((item) => {
      if (Array.isArray(item.serialKeys)) {
        countKeys += item.serialKeys.length;
        item.serialKeys = item.serialKeys.map((serialKey) => ({
          ...serialKey,
          client_product_id: item.product_id
        }));
      }
      return item;
    });

    if (countKeys === 0){
      return res.status(200).json({ 
        success: false,
        message: "There is nothing to do",
      });
    }

    const isOrderFulfilled = await determineOrderHasCompleted(transaction);
    
      
      if (filteredTransaction) {
        const recentKeyIds = filteredTransaction.orderData.flatMap(item => {
          return item.serialKeys.map((serialKey) => serialKey._id);
        });
        console.log("recentKeyIds", recentKeyIds)
          
        const response = await sendUpdatedOrderDataToClient(filteredTransaction, apiData);
        console.log("sendUpdatedOrderDataToClient", response?.data);
        if(response?.data?.status === 'complete'){
          const recentKeyIds = filteredTransaction.orderData.flatMap(item => {
            return item.serialKeys.map((serialKey) => serialKey._id);
          });

          transaction.orderData.map((item) => {
            if (Array.isArray(item.serialKeys)) {
              item.serialKeys = item.serialKeys.map((serialKey) => {
                if (recentKeyIds.some(recentId => recentId.equals(serialKey._id))) {
                  return {
                    ...serialKey, // Convert to plain object before modification
                    isDeliverred: true
                  };
                }
                return serialKey; // Keep other serial keys as plain objects
              });
            }
          });
          if (isOrderFulfilled){
            transaction.transactionStatus = 'complete';
          }

          await transaction.save();
        }

        return res.status(200).json({ 
            success: true,
            message: "Order updated successfully",
            filteredTransaction
        });
      }else{
        return res.status(200).json({ 
          success: false,
          message: "Order status should be complete to update",
        });
      }
    // } catch (error) {
    //     console.log(error);
    //     return res.status(500).json({ message: "Internal server error" });
    // }
  },

  reissueSerialKey: async (transaction) => {
    try {
      if (!transaction) {
        return false;
      }
      if (!transaction.orderData) {
        return false;
      }
      if (typeof transaction.orderData === 'object') {
        // Step 1: Fetch all serial keys for the order items
        const serialKeysPromises = transaction.orderData.map(async (item) => {
          const serialKeys = await shopController.getSerialKey(item.op_id, item.quantity);
          if (!serialKeys) {
            return { op_id: item.op_id, serialKeys: [] }; // Return object with op_id and empty serialKeys
          }
          return { op_id: item.op_id, serialKeys }; // Return object with op_id and its serialKeys
        });

        // Step 2: Wait for all serial keys to be fetched
        const allSerialKeys = await Promise.all(serialKeysPromises);
        // logToFile(allSerialKeys);
        

        // Step 3: Update each orderData item with the fetched serialKeys
        const updatedOrderData = transaction.orderData.map((item) => {
          // Find the serial keys for the current item
          const serialKeyForItem = allSerialKeys.find((key) => key.op_id.toString() === item.op_id.toString());
          
          if (serialKeyForItem) {
            item.serialKeys = serialKeyForItem.serialKeys; // Update the serialKeys for the item
          } else {
            item.serialKeys = []; // If no serial keys found, assign an empty array
          }

          return item;
        });

        // Step 4: Update the entire Transaction document with the updated orderData
        const newTransaction = await Transaction.findOneAndUpdate(
          { siteId: transaction.siteId, invoice_no: transaction.invoice_no }, // Search criteria
          { $set: { orderData: updatedOrderData, transactionStatus: "complete" } }, // Update the whole orderData array
          { upsert: false, new: true } // No upsert, just update
        );

        if (newTransaction) {
          return {updatedOrderData, allSerialKeys};
        }

      }
      return false;
    } catch (error) {
      console.log(error);
      return false;
    }
  },

  updateKeyStatus: async (transaction) => {
    try {            
      if (!transaction) {
        console.log("Transaction not found");
        return;
      }

      const updatedTransaction = await Transaction.findById(transaction._id)
      .populate({
        path: "orderData.serialKeys._id",
        model: "SerialNumber"
      })
      .lean();
      updatedTransaction.orderData = updatedTransaction.orderData.map(order => {
        order.serialKeys = order.serialKeys.map(sk => sk._id); // _id সরিয়ে দিন
        return order;
      });
      const serialKeyIds = updatedTransaction.orderData.flatMap(item => 
        item.serialKeys.map(key => key._id) // Extracting _id from serialKeys
      );

      if (serialKeyIds.length === 0) {
        console.log("No serial keys found in transaction");
        return;
      }

      await SerialNumber.updateMany(
        { _id: { $in: serialKeyIds } }, // Match serialKeys
        { $set: { 
          "status": "sold",
          "customerId": updatedTransaction.customerId,
          "siteId": updatedTransaction.siteId,
          "transactionId": transaction._id
        } } // Update fields (example: { status: "used" })
      );

      return updatedTransaction;

    } catch (error) {
        console.log(error)
        return false;
    }
  },
};

module.exports = serialNumberController;
