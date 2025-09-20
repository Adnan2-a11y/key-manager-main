const User = require("../database/userDB");
const Customer = require("../database/customerDB");
const Transaction = require("../database/transactions");
const Product = require("../database/product/productDB");
const SerialNumber = require("../database/product/serialNumberDb");
const { logToFile } = require("../utils/SaveLogs");
const { isValidEmail } = require("../utils/Helper");
const { mongoose } = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

const shopController = {

    newOrder: async (req, res) => {

        try {
            const error = {};
            const keys = {};
            let order_status = "pending";
            const user = req.user;

            if(!user){
                error['user'] = "User not found";
                return res.status(400).json({
                    message: "User not found",
                    errors: error
                });
            }
            
            const { invoice_no, customer, product } = req.body;
            logToFile(req.body, "newOrder");
            
            if (invoice_no && !isNaN(Number(invoice_no)) && customer && product) {
                const { first_name, last_name, email, phone, address, city, state, zip, country  } = customer;

                if(!first_name || !last_name || !email || isValidEmail(email) === false){
                    error['customer'] = {};
                    if(!first_name){
                        error['customer']['first_name'] = "first_name is required";
                    }
                    if(!last_name){
                        error['customer']['last_name'] = "last_name is required";
                    }
                    if(!email){
                        error['customer']['email'] = "email is required";
                    }
                    if(isValidEmail(email) === false){
                        error['customer']['email'] = "email is not valid";
                    }
                    return res.status(400).json({ 
                        message: "Missing required fields",
                        errors: error
                    });
                }

                // we need to calculate the total amount by summing up the prices of all the products
                const productData = await Product.findOne({ _id: product.op_id });
                
                if (!productData) {
                    logToFile(`Product with id ${product.op_id} not found`);
                    error['products'] = "Product not found: " + product.op_id;
                    product.serialKeys = null; 
                    product.reason = "Product not found";
                    product.error_code = 5640;
                } else {
                    // now we can assure that product is exists in our system                    
                    // check if sellPrice is present in productData if not then use regularPrice
                    if(!productData.sellPrice){
                        productData.sellPrice = productData.regularPrice;
                    }
                    const total = productData.sellPrice * product.quantity;                        
                    if(user.balance < total){
                        error['balance'] = "User balance is not enough";
                        product.serialKeys = null; 
                        product.reason = "User balance is not enough";
                        product.error_code = 5650;
                        product.amount = total;
                    }else{
                        
                        // Now we assure that use has enough balance to buy this product
                        // Now proceed to assign serial key
                        const serialKey = await shopController.getSerialKey(product.op_id, product.quantity);
                        // const serialKey = false;
                        if (!serialKey) {
                            error['serialKey'] = "serialKey is not available";
                            product.serialKeys = null; 
                            product.reason = "Currently stock not available"; 
                            product.error_code = 5660;
                            product.amount = total;
                        }else{
                            // Now we assure that serial key is available
                            product.serialKeys = serialKey;
                            user.balance -= total;
                            const rUser = await User.findByIdAndUpdate(user._id, { balance: user.balance }, { new: true });

                            product.amount = total;
                            order_status = "complete";
                        }
                    }
                }              

                // check if customer exists in database else create a new customer
                const existingCustomer = await Customer.findOne({ email });
                if (existingCustomer) {
                    customer._id = existingCustomer._id;
                }else{
                    const newCustomer = new Customer({
                        first_name,
                        last_name,
                        email,
                        phone,
                        address,
                        city,
                        state,
                        zip,
                        country
                    });
                    await newCustomer.save();
                    customer._id = newCustomer._id;
                }

                const existingTransaction = await Transaction.findOne({ siteId: req.siteId, invoice_no });

                logToFile(existingTransaction, "existingTransaction");

                try {
                    if (existingTransaction) {
                        const existingOrderData = existingTransaction.orderData || [];
                        logToFile(existingOrderData, "existingTransaction");  // Log existing order data for debugging

                        // Check if the product already exists in the orderData array
                        const isExists = existingOrderData.some((item) => item.op_id.equals(ObjectId(product.op_id)));
                        logToFile(isExists, "existingTransaction");

                        if (!isExists) {
                            // Add the new product to orderData if it doesn't exist
                            updatedTransaction = await Transaction.findOneAndUpdate(
                                { siteId: req.siteId, invoice_no },
                                {
                                    $push: { orderData: product }  // Push the new product into the orderData array
                                },
                                { new: true }  // Return the updated document
                            );
                            logToFile(updatedTransaction, "existingTransaction");  // Log the updated transaction
                        } else {
                            logToFile("Product already exists in the orderData", "existingTransaction");
                        }
                    } else {
                        // If no existing transaction is found, create a new transaction
                        updatedTransaction = await Transaction.create({
                            siteId: req.siteId,
                            invoice_no,
                            customerId: customer._id,
                            transactionType: "order",
                            transactionAmount: product.amount,
                            transactionStatus: order_status,
                            orderData: [product],  // Add the first product to orderData
                        });
                        logToFile(updatedTransaction, "existingTransaction");  // Log the newly created transaction
                    }
                } catch (error) {
                    logToFile(error, "transactionError");
                }


                if (product.serialKeys && product.serialKeys.length > 0) {
                    await shopController.updateSerialKeyStatus(updatedTransaction, req.siteId, product);
                }

                return res.status(200).json({
                    message: "new order",
                    data: product
                })
            }else{
                
                if(!invoice_no){
                    error['invoice_no'] = "invoice_no is required";
                }
                if(isNaN(Number(invoice_no))){
                    error['invoice_no'] = "invoice_no should be number";
                }
                if(!customer){
                    error['customer'] ="customer is required";
                }
                if(!product){
                    error['products'] = "product is required";
                }
                return res.status(400).json({ 
                    message: "Missing required fields",
                    errors: error
                });
            }

        } catch (error) {
            // logToFile(error);
        }
    },

    newOrderV2: async (req, res) => {
        try {
            logToFile(req.body, "newOrderV2");
            console.log(req.body);
            return res.status(200).json({ message: "new order v2" });
        } catch (error) {
            return res.status(500).json({ message: "Internal server error" });
        }
    },

    getSerialKey: async (productId, limit) => {
        try {
            const serialNumbers = await SerialNumber.find({ productId, status: { $nin: ["sold", "expired"] } }).limit(limit).exec();
            if (serialNumbers.length < limit) {
                return false;
            }
    
            return serialNumbers;

        } catch (error) {
            return false;
        }
    },

    updateSerialKeyStatus: async (transaction, siteId, product) => {
        try {            
            console.log(product);
            const serialNumberIds = product.serialKeys.map(item => item._id);
            await SerialNumber.updateMany(
                { _id: { $in: serialNumberIds } },
                { $set: { 
                    status: "sold",
                    transactionId: transaction._id,
                    customerId: transaction.customerId,
                    siteId
                } }
            );
    
            return true;

        } catch (error) {
            console.log(error)
            return false;
        }
    },

    getAllOrders: async (req, res) => {
        try {
            const { page = 1, status, store, source, startDate, endDate, type = '', limit = 10, query = '' } = req.query;
            const lookUpStage = {};
            const matchStage = {};
            const pipeline = [];

            if(status){
                matchStage.transactionStatus = status;
            }

            if(store){
                matchStage.siteId = new ObjectId(store);
            }
            
            // if(source){
            //     matchStage.source = source;
            // }

            let queryType = '';

            if (query && !Number.isNaN(Number(query))) {
                queryType = 'order';
            } else {
                queryType = 'customer';
            }
            
            if(query && queryType === 'order'){
                matchStage.invoice_no = parseInt(query);
            }
            if(startDate && endDate){
                const start = dayjs(startDate, 'MM-DD-YYYY').startOf('day');
                const end = dayjs(endDate, 'MM-DD-YYYY').endOf('day');                
                
                matchStage.createdAt = {
                    $gte: start.toDate(),
                    $lte: end.toDate()
                }

            }

            pipeline.push({ $lookup: 
                {
                    from: "customers",
                    localField: "customerId",
                    foreignField: "_id",
                    as: "customer"
                }
            });

            pipeline.push({ $unwind: "$customer"});

            if(query && queryType === 'customer'){
                matchStage["customer.email"] =  { $regex: query, $options: "i" }                
            }
            pipeline.push({ $match: matchStage });
            pipeline.push({ $lookup: 
                {
                    from: "apikeys",
                    localField: "siteId",
                    foreignField: "_id",
                    as: "site"
                }
            });
            pipeline.push({ $unwind: "$site" });
            pipeline.push({ $sort: 
                { 
                    status : -1,
                    transaction_date: -1
                }
            });
            pipeline.push({ $facet: 
                {
                    data: [
                    { $skip: (parseInt(page) - 1) * parseInt(limit) },
                    { $limit: parseInt(limit) },
                    ],
                    count: [
                    { $count: "total" }
                    ]
                }
            });

              
            const results = await Transaction.aggregate(pipeline);
            const count = results[0].count[0]?.total || 0;
            const data = results[0].data;
                
            return res.status(200).json({ 
                success: true,
                message: "Orders",
                counts: count,
                orders: data
            });
        } catch (error) {
            console.log(error);
            return res.status(200).json({ success: false, message: "Internal server error" });
        }
    },
    getAllOrdersBySiteId: async (req, res) => {
        try {
            const [orders, total] = await Promise.all([
                Transaction.find({ siteId: req.siteId, transactionType: "order" }).sort({ createdAt: -1 }),
                Transaction.countDocuments({ transactionType: "order" })
            ]);
            return res.status(200).json({ message: "Orders", count: total, data: orders });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    },
    getAllOrdersByUser: async (req, res) => {
        try {
            const [orders, total] = await Promise.all([
                Transaction.find({ userId: req.user._id, transactionType: "order" }).sort({ createdAt: -1 }),
                Transaction.countDocuments({ transactionType: "order" })
            ]);
            return res.status(200).json({ message: "Orders", count: total, data: orders });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    },

    viewOrder: async (req, res) => {
        const { id: transactionId } = req.params;
        try {

            const transaction = await Transaction.findOne({transactionId})
                .populate("customerId", "first_name last_name email country userId")
                .populate("siteId", "name")
                .populate("orderData.op_id", "productName productImg productId")
                .populate({
                    path: "orderData.serialKeys._id",
                    model: "SerialNumber",
                    select: "serialNumber serialNumberId supplierId type validity warrantyDate purchaseDate"
                });
            res.status(200).json({
                message: `We have found transaction with id #${transactionId}`,
                success: true,
                transaction,
            })
        } catch (error) {
            console.log(`Error fetching order #${transactionId}`, error);
            res.status(404).json({
                message: `Error fetching order #${transactionId}`,
                success: false,
                error,
            })
        }
    },
    deleteOrder: async (req, res) => {
        try {
            const params = req.params;
            console.log("tranxId", params.id);
            const result = await Transaction.deleteOne({transactionId: params.id});
            console.log(result)
            res.status(200).json({"success" : true, "message": "Order has been deleted"});
         } catch (e) {
            console.log(e)
            res.status(200).json({"success" : false, "message": "Order deletion error occured"});
         }
    },
}

module.exports = shopController;