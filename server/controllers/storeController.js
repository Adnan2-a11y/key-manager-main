const User = require("../database/userDB");
const Customer = require("../database/customerDB");
const Transaction = require("../database/transactions");
const Product = require("../database/product/productDB");
const SerialNumber = require("../database/product/serialNumberDb");
const { logToFile } = require("../utils/SaveLogs");
const { isValidEmail, sendOrderDataToClient, updateKeyDeliveryStatus } = require("../utils/Helper");
const mongoose = require("mongoose");
const ApiKey = require("../database/apiKeyDB");
const telegramBotController = require("./telegramBotController");
const integrationController = require("./integrationController");
const ObjectId = mongoose.Types.ObjectId;
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;

const storeController = {
    newOrder: async (req, res) => {
        try {
            let error_messages = {};
            let keyCounting = {
                totalKeyCount: 0,
                stockAvailableCount: 0
            };
            let order_status = "pending";
            // need to check if user have enough balance
            const user = req.user;

            if(!user){
                error_messages.user = "User not found";
                throw new Error("User not found");
            }
            
            const { started_at, invoice_no, customer, items, total, subtotal, total_tax, total_discount, total_shipping, total_fee, currency, order_note, locale, payment_method, payment_method_title, status} = req.body;
            const reqBody = req.body;
            // logToFile(req.body);
            const existingTransaction = await Transaction.findOne({ siteId: req.siteId, invoice_no });
            if (!existingTransaction) {
                res.status(200).json({ message: `Order #${invoice_no} has received, Please allow us to process your order. Thank you.` });
                if (invoice_no && !isNaN(Number(invoice_no)) && customer && items) {
                    const { first_name, last_name, email, phone, address, city, state, zip, country  } = customer;

                    if(!first_name || !last_name || !email || isValidEmail(email) === false){
                        if(!first_name){
                            error_messages.customer_first_name = "first_name is required";
                            throw new Error("first_name is required");
                        }
                        
                        if(!last_name){
                            error_messages.customer_last_name = "last_name is required";
                            throw new Error("last_name is required");
                        }
                        
                        if(!email){
                            error_messages.customer_email = "email is required";
                            throw new Error("email is required");
                        }
                        if(isValidEmail(email) === false){
                            error_messages.customer_email = "email is not valid";
                            throw new Error("email is not valid");
                        }
                    }

                    
                    
                    
                    
                    // Find all the remote product IDs
                    const remoteProductIds = items.flatMap(item => {
                        let remoteProducts = item.meta_data._ac_remote_product || [];
                        if( typeof remoteProducts === 'string' ){
                            remoteProducts = JSON.parse(remoteProducts);
                        }
                        return remoteProducts.map(p => p.id);
                    });

                    const objectIds = remoteProductIds.map(id => mongoose.isObjectIdOrHexString(id) ? ObjectId.createFromHexString(id) : null).filter(id => id !== null);

                    const productData = await Product.find({
                        _id: { $in: objectIds }
                    });

                    const foundIds = productData.map(p => p._id.toString());
                    const missingIds = remoteProductIds.filter(id => !foundIds.includes(id));

                    if (missingIds.length > 0) {
                        throw new Error(`Missing product(s) with ID(s): ${missingIds.join(', ')}`);
                    }

                    // Create a map of product IDs to their price
                    const productPriceMap = new Map();
                        productData.forEach(product => {
                        productPriceMap.set(product._id.toString(), product.sellPrice);
                    });
                    let processedData;
                    try{
                        // Calculate total price for each item
                        processedData = await processItems(productPriceMap, reqBody);
                        error_messages = {...error_messages, ...processedData.messages}
                        keyCounting = processedData.count;  
    
                    } catch (error){
                        console.log("error happens")
                    }
                    

                    if (status === 'processing' || reqBody.status === 'completed'){
                                            
                        if(user.balance < processedData.totalValue){
                            error_messages.balance = "User balance is not enough";
                            error_messages.code = "5650";
                            throw new Error("User balance is not enough");
                        }else{
                            user.balance -= processedData.totalValue;
                            await User.findByIdAndUpdate(user._id, { balance: user.balance }, { new: true });
                            if(keyCounting.totalKeyCount === keyCounting.stockAvailableCount){
                                order_status = "processing";
                            }else if(keyCounting.totalKeyCount > keyCounting.stockAvailableCount){
                                order_status = "partial";
                            }else{
                                order_status = "pending";
                            }
                        }     
                    }        

                    // check if customer exists in database else create a new customer
                    let existingCustomer = await Customer.findOne({ email });
                    if (existingCustomer) {
                        customer._id = existingCustomer._id;
                    }else{
                        existingCustomer = new Customer({
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
                        await existingCustomer.save();
                        customer._id = existingCustomer._id;
                    }                    
                        
                    items.forEach(item => {
                        const meta = item.meta_data;
                        if (meta && typeof meta._ac_remote_product === "string") {
                            try {
                            meta._ac_remote_product = JSON.parse(meta._ac_remote_product);
                            } catch (e) {
                            console.error("Failed to parse _ac_remote_product:", e);
                            meta._ac_remote_product = [];
                            }
                        }
                    });


                    updatedTransaction = await Transaction.create({
                        invoice_no,
                        customerId: customer._id,
                        transactionType: "order",
                        transactionAmount: processedData.totalValue,
                        transactionStatus: order_status,
                        siteId: req.siteId,
                        orderData: reqBody.items,
                        transaction_date: new Date(started_at * 1000),
                        currency,
                        locale,
                        order_note,
                        payment_method,
                        payment_method_title,
                        subtotal,
                        total,
                        total_discount,
                        total_fee,
                        total_shipping,
                        total_tax,
                        error_messages
                    });
                                        

                    if (updatedTransaction.orderData && updatedTransaction.orderData.length > 0) {
                        const result = await storeController.updateSerialKeyStatus(updatedTransaction, req.siteId);
                        if (result){
                            const apiData = await Transaction.findById(updatedTransaction._id)
                            .select("invoice_no transactionStatus transactionId orderData")
                            .populate({
                                path: "siteId",
                                select: "name webhook_key",                            
                            });
                                                        
                            const response_from_client = await sendOrderDataToClient(apiData);
                            
                            if (response_from_client?.status === 200){
                                
                            }else{
                                await Transaction.findOneAndUpdate({ _id: updatedTransaction._id }, { $set: { transactionStatus: "failed", error_messages: {
                                    message: response_from_client?.status + " : Serial keys could not be received by client",
                                }  } }, { new: true })
                            }
                        }

                    }
                }else{
                    
                    if(!invoice_no){
                        error_messages['invoice_no'] = "invoice_no is required";
                    }
                    if(isNaN(Number(invoice_no))){
                        error_messages['invoice_no'] = "invoice_no should be number: " + invoice_no;
                    }
                    if(!customer){
                        error_messages['customer'] ="customer is required";
                    }
                    if(!items){
                        error_messages['products'] = "product is required";
                    }
                    
                    logToFile(error_messages);
                }
            }else{
                res.status(409).json({ message: "Order already exists" });
            }

        } catch (error) {
            logToFile(error.message);
        }
    },
    newOrderFromMissing: async (req) => {
        try {
            let error_messages = {};
            let keyCounting = {
                totalKeyCount: 0,
                stockAvailableCount: 0
            };
            let order_status = "pending";
            // need to check if user have enough balance
            const user = req.user;

            if(!user){
                error_messages.user = "User not found";
                throw new Error("User not found");
            }
            
            const { started_at, invoice_no, customer, items, total, subtotal, total_tax, total_discount, total_shipping, total_fee, currency, order_note, locale, payment_method, payment_method_title, status} = req.body;
            const reqBody = req.body;
            
            const existingTransaction = await Transaction.findOne({ siteId: req.siteId, invoice_no });
            if (!existingTransaction) {
                if (invoice_no && !isNaN(Number(invoice_no)) && customer && items) {
                    const { first_name, last_name, email, phone, address, city, state, zip, country  } = customer;

                    if(!first_name || !last_name || !email || isValidEmail(email) === false){
                        if(!first_name){
                            error_messages.customer_first_name = "first_name is required";
                            throw new Error("first_name is required");
                        }
                        
                        if(!last_name){
                            error_messages.customer_last_name = "last_name is required";
                            throw new Error("last_name is required");
                        }
                        
                        if(!email){
                            error_messages.customer_email = "email is required";
                            throw new Error("email is required");
                        }
                        if(isValidEmail(email) === false){
                            error_messages.customer_email = "email is not valid";
                            throw new Error("email is not valid");
                        }
                    }

                    
                    
                    // console.log(items);
                    
                    // Find all the remote product IDs
                    const remoteProductIds = items.flatMap(item => {
                        let remoteProducts = item.meta_data._ac_remote_product || [];
                        if( typeof remoteProducts === 'string' ){
                            remoteProducts = JSON.parse(remoteProducts);
                        }
                        return remoteProducts.map(p => p.id);
                    });

                    // console.log(remoteProductIds);
                    // return;

                    const objectIds = remoteProductIds.map(id => mongoose.isObjectIdOrHexString(id) ? ObjectId.createFromHexString(id) : null).filter(id => id !== null);

                    const productData = await Product.find({
                        _id: { $in: objectIds }
                    });

                    const foundIds = productData.map(p => p._id.toString());
                    const missingIds = remoteProductIds.filter(id => !foundIds.includes(id));

                    if (missingIds.length > 0) {
                        throw new Error(`Missing product(s) with ID(s): ${missingIds.join(', ')}`);
                    }

                    // Create a map of product IDs to their price
                    const productPriceMap = new Map();
                        productData.forEach(product => {
                        productPriceMap.set(product._id.toString(), product.sellPrice);
                    });
                    let processedData;
                    try{
                        // Calculate total price for each item
                        processedData = await processItems(productPriceMap, reqBody);
                        error_messages = {...error_messages, ...processedData.messages}
                        keyCounting = processedData.count;  
    
                    } catch (error){
                        console.log("error happens")
                    }
                    

                    if (status === 'processing' || reqBody.status === 'completed'){
                                            
                        if(user.balance < processedData.totalValue){
                            error_messages.balance = "User balance is not enough";
                            error_messages.code = "5650";
                            throw new Error("User balance is not enough");
                        }else{
                            user.balance -= processedData.totalValue;
                            await User.findByIdAndUpdate(user._id, { balance: user.balance }, { new: true });
                            if(keyCounting.totalKeyCount === keyCounting.stockAvailableCount){
                                order_status = "processing";
                            }else if(keyCounting.totalKeyCount > keyCounting.stockAvailableCount){
                                order_status = "partial";
                            }else{
                                order_status = "pending";
                            }
                        }     
                    }        

                    // check if customer exists in database else create a new customer
                    let existingCustomer = await Customer.findOne({ email });
                    if (existingCustomer) {
                        customer._id = existingCustomer._id;
                    }else{
                        existingCustomer = new Customer({
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
                        await existingCustomer.save();
                        customer._id = existingCustomer._id;
                    }                    
                        
                    items.forEach(item => {
                        const meta = item.meta_data;
                        if (meta && typeof meta._ac_remote_product === "string") {
                            try {
                            meta._ac_remote_product = JSON.parse(meta._ac_remote_product);
                            } catch (e) {
                            console.error("Failed to parse _ac_remote_product:", e);
                            meta._ac_remote_product = [];
                            }
                        }
                    });


                    updatedTransaction = await Transaction.create({
                        invoice_no,
                        customerId: customer._id,
                        transactionType: "order",
                        transactionAmount: processedData.totalValue,
                        transactionStatus: order_status,
                        siteId: req.siteId,
                        orderData: reqBody.items,
                        transaction_date: new Date(started_at * 1000),
                        currency,
                        locale,
                        order_note,
                        payment_method,
                        payment_method_title,
                        subtotal,
                        total,
                        total_discount,
                        total_fee,
                        total_shipping,
                        total_tax,
                        error_messages
                    });
                                        

                    if (updatedTransaction.orderData && updatedTransaction.orderData.length > 0) {
                        const result = await storeController.updateSerialKeyStatus(updatedTransaction, req.siteId);
                        if (result){
                            const apiData = await Transaction.findById(updatedTransaction._id)
                            .select("invoice_no transactionStatus transactionId orderData")
                            .populate({
                                path: "siteId",
                                select: "name webhook_key",                            
                            });
                                                        
                            const response_from_client = await sendOrderDataToClient(apiData);
                            
                            if (response_from_client?.status === 200){
                                
                            }else{
                                await Transaction.findOneAndUpdate({ _id: updatedTransaction._id }, { $set: { transactionStatus: "failed", error_messages: {
                                    message: response_from_client?.status + " : Serial keys could not be received by client",
                                }  } }, { new: true })
                            }
                        }

                    }
                }else{
                    
                    if(!invoice_no){
                        error_messages['invoice_no'] = "invoice_no is required";
                    }
                    if(isNaN(Number(invoice_no))){
                        error_messages['invoice_no'] = "invoice_no should be number: " + invoice_no;
                    }
                    if(!customer){
                        error_messages['customer'] ="customer is required";
                    }
                    if(!items){
                        error_messages['products'] = "product is required";
                    }
                    
                    logToFile(error_messages);
                }
            }else{
                res.status(409).json({ message: "Order already exists" });
            }

        } catch (error) {
            logToFile(error.message);
        }
    },

    updateOrderAndGetKey: async(req, res) => {

        let error_messages = {};
        let keyCounting = {
            totalKeyCount: 0,
            stockAvailableCount: 0
        };

        const user = req.user;

        if(!user){
            error_messages.user = "User not found";
            throw new Error("User not found");
        }

        res.status(200).json({success: true, message: "Key issue request received!"});

        const reqBody = req.body;

        const existingTransaction = await Transaction.findOne({ siteId: req.siteId, invoice_no: reqBody.invoice_no });
        if (existingTransaction) {
            // Find all the remote product IDs
            const remoteProductIds = reqBody.items.flatMap(item => {
                let remoteProducts = item.meta_data._ac_remote_product || [];
                if( typeof remoteProducts === 'string' ){
                    remoteProducts = JSON.parse(remoteProducts);
                }
                return remoteProducts.map(p => p.id);
            });

            const objectIds = remoteProductIds.map(id => mongoose.isObjectIdOrHexString(id) ? ObjectId.createFromHexString(id) : null).filter(id => id !== null);

            const productData = await Product.find({
                _id: { $in: objectIds }
            });

            const foundIds = productData.map(p => p._id.toString());
            const missingIds = remoteProductIds.filter(id => !foundIds.includes(id));
            

            if (missingIds.length > 0) {
                throw new Error(`Missing product(s) with ID(s): ${missingIds.join(', ')}`);
            }

            // Create a map of product IDs to their price
            const productPriceMap = new Map();
            productData.forEach(product => {
                productPriceMap.set(product._id.toString(), product.sellPrice);
            });

            // Calculate total price for each item
            const processedData = await processItems(productPriceMap, reqBody);

            error_messages = {...error_messages, ...processedData.messages}
            keyCounting = processedData.count;

            if (reqBody.status === 'processing' || reqBody.status === 'completed'){      
                if(user.balance < processedData.totalValue){
                    error_messages.balance = "User balance is not enough";
                    error_messages.code = "5650";
                    throw new Error("User balance is not enough");
                }else{
                    user.balance -= processedData.totalValue;
                    await User.findByIdAndUpdate(user._id, { balance: user.balance }, { new: true });
                    if(keyCounting.totalKeyCount === keyCounting.stockAvailableCount){
                        order_status = "processing";
                    }else if(keyCounting.totalKeyCount > keyCounting.stockAvailableCount){
                        order_status = "partial";
                    }else{
                        order_status = "pending";
                    }
                }     
            } 

            // check if customer exists in database else create a new customer
            const customer = reqBody.customer;
            let existingCustomer = await Customer.findOne({ email: customer.email });
            if (existingCustomer) {
                customer._id = existingCustomer._id;
            }else{
                existingCustomer = new Customer({
                    first_name: customer.first_name,
                    last_name: customer.last_name,
                    email: customer.email,
                    phone: customer.phone,
                    address: customer.address,
                    city: customer.city,
                    state: customer.state,
                    zip: customer.zip,
                    country: customer.country
                });
                await existingCustomer.save();
                customer._id = existingCustomer._id;
            } 

            reqBody.items.forEach(item => {
                const meta = item.meta_data;
                if (meta && typeof meta._ac_remote_product === "string") {
                    try {
                        meta._ac_remote_product = JSON.parse(meta._ac_remote_product);
                    } catch (e) {
                        console.error("Failed to parse _ac_remote_product:", e);
                        meta._ac_remote_product = [];
                    }
                }
            });
            // console.log("before save", existingTransaction.orderData);
            existingTransaction.customerId = customer._id;
            existingTransaction.transactionStatus = order_status;
            existingTransaction.orderData = reqBody.items;
            
            await existingTransaction.save();
            // console.log("after save", existingTransaction.orderData);

            if (existingTransaction.orderData && existingTransaction.orderData.length > 0) {
                const result = await storeController.updateSerialKeyStatus(existingTransaction, req.siteId);
                if (result){
                    const apiData = await Transaction.findById(existingTransaction._id)
                    .select("invoice_no transactionStatus transactionId orderData")
                    .populate({
                        path: "siteId",
                        select: "name webhook_key",                            
                    });
                    const response_from_client = await sendOrderDataToClient(apiData);
                    
                    if (response_from_client?.status !== 200){
                        await Transaction.findOneAndUpdate({ _id: existingTransaction._id }, { $set: { transactionStatus: "failed", error_messages: {
                            message: response_from_client?.status + " : Serial keys could not be received by client",
                        }  } }, { new: true })   
                    }
                    return;
                }
            }
        }else{
            await storeController.newOrderFromMissing(req);
        }
    },

    getOrderStatus: async (req, res) => {
        const user = req.user;

        if(!user){
            error_messages.user = "User not found";
            throw new Error("User not found");
        }

        const { _id, status, message, order_id } = req.body;
        // console.log(req.body);

        if (_id == "" || status === "" || order_id === ""){
            return res.status(200).json({"success": false, "message": "Invalid data", "data": req.body });
        }

        // mongoose.isObjectIdOrHexString(id)
        const existingTransaction = await Transaction.findOne({_id});
        if(!existingTransaction){
            return res.status(200).json({"success": false, "message": "Order not found", "data": req.body });
        }
        
        if(status === "complete" || status === "partial"){
            existingTransaction.orderData.map((item) => {
                if (Array.isArray(item.serialKeys)) {
                    item.serialKeys = item.serialKeys.map((serialKey) => {
                        
                        return {
                        ...serialKey, // Convert to plain object before modification
                        isDeliverred: true
                        };
                    });
                }
            });
            existingTransaction.transactionStatus = status;
            await existingTransaction.save();
            await Promise.all([
                        telegramBotController.sendNewOrderToMerchant(existingTransaction),
                        telegramBotController.sendNewOrderToReseller(existingTransaction),
                        telegramBotController.sendNewOrderToAdmin(existingTransaction),
                        
                        // we need to send congrat message from here, when any new order placed


                    ])

        }else{
            await Promise.all([
                        telegramBotController.sendNewOrderToMerchant(existingTransaction),
                        telegramBotController.sendNewOrderToReseller(existingTransaction),
                        telegramBotController.sendNewOrderToAdmin(existingTransaction),
                        
                        // we need to send congrat message from here, when any new order placed


                    ])
        }
        return res.status(200).json({"success": true, "message": "Successfully notified" });

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

    getSerialKey: async (productId, client_product_id, limit) => {
        try {
            const pid = ObjectId.createFromHexString(productId);
            const serialNumbers = await SerialNumber.aggregate([
                { $match: { productId: pid, status: 'available' } },
                {
                    $group: {
                      _id: { product_id: "$productId", serialNumber: "$serialNumber" }, // group by both product and key
                      doc: { $first: "$$ROOT" } // get one full document per key
                    }
                },
                {
                    $replaceWith: "$doc" // unwrap
                },
                // get the first n serial numbers
                { $limit: limit }
            ]);
            
            if (serialNumbers.length === limit) {
                serialNumbers.forEach(serialNumber => {
                    serialNumber.client_product_id = client_product_id;
                    serialNumber.isDeliverred = false;
                })
                return serialNumbers;
            }else{
                // count total serial numbers
                const totalSerialNumbers = await SerialNumber.countDocuments({ productId: pid, status: 'available' });
                if (totalSerialNumbers < limit) {
                    return [];
                }else{
                    // get random serial numbers
                    const keys = await SerialNumber.aggregate([
                        { $match: { productId: pid, status: 'available' } },
                        { $sort: { _id: 1 } },
                        { $limit: 3 }
                    ]);
                    keys.forEach(key => {
                        key.client_product_id = client_product_id;
                        key.isDeliverred = false;
                    })
                    return keys;
                }
                
            }
        } catch (error) {
            console.log(error)
            return false;
        }
    },

    updateSerialKeyStatus: async (transaction, siteId) => {
        try {
            const serialNumberIds = transaction.orderData.map(item => item.serialKeys).flat().map(key => key._id);
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
            const page = req.query.page ? parseInt(req.query.page) : 1; // Default page 1
            const type = req.query.type ? req.query.type : ''; // Default page 1
            const limit = 10; // 10 items per page
            
            const [orders, total] = await Promise.all([
                Transaction.find({ transactionType: "order", ...(type ? { transactionStatus: type } : {}) }).sort({ createdAt: -1 })
                    .populate({ path: 'customerId', select: 'first_name last_name email' })
                    .populate({ path: 'siteId', select: 'name' })
                    .skip((page - 1) * limit)
                    .limit(limit),
                Transaction.find({...(type ? { transactionStatus: type } : {})}).countDocuments() // Total count for pagination
            ]);
                
            return res.status(200).json({ message: "Orders", count: total, data: orders });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    },
    getAllOrdersBySiteId: async (req, res) => {
        // return res.status(200).json({ message: "Orders" });
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
        // return res.status(200).json({ message: "Orders" });
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
    getAllStores: async (req, res) => {
        try {
            const { search = '', limit = 20 } = req.query;

            const stores = await ApiKey.find({ name: { $regex: search, $options: 'i' } }).select('name status').limit(limit);
            res.status(200).json({ success: true, count: stores.length, data: stores });
        } catch (error) {
            console.log(error);
            return res.status(200).json({ success: false, message: error.message });
        }
    },
    getStoreById: async (req, res) => {
        try {
            const { id } = req.params;
            const store = await ApiKey.findById(id).select("name");
            return res.status(200).json({success: true, data: store, message: "Here is your data"});

        } catch (error) {
            return res.status(500).json({success: false, message: error.message})
        }
    },
    startSync: async (req, res) => {
        const {storeId, invoice, date, range} = req.query;
        if(!storeId){
            return res.status(200).json({success: false, message: "Something was went wrong"});
        }

        const { name, siteUrl, consumerKey, consumerSecret } = await ApiKey.findById(storeId);
        const api = new WooCommerceRestApi({
            url: siteUrl ?? `https://${name}`,
            consumerKey: consumerKey,
            consumerSecret: consumerSecret,
            version: 'wc/v3',
            queryStringAuth: true
        });

        // Single order import
        if(invoice){
            try{
                const result = await integrationController.fetchAll('orders', api, storeId, {include: [invoice]})
                await ApiKey.findOneAndUpdate({ _id: storeId.toString() }, { syncStatus: '', status: 'live' }, { new: true });
                return res.status(200).json(result);
            } catch (error) {
                await ApiKey.findOneAndUpdate({ _id: storeId.toString() }, { syncStatus: '', status: 'live' }, { new: true });
                return res.status(200).json({success: false, message: "There was something happend"});
            }
        }

        // Latest/date after order import
        if(date){
            try{
                const result = await integrationController.fetchAll('orders', api, storeId, {after: date + 'T00:00:00'})
                await ApiKey.findOneAndUpdate({ _id: storeId.toString() }, { syncStatus: '', status: 'live' }, { new: true });
                return res.status(200).json(result);
            } catch (error) {
                await ApiKey.findOneAndUpdate({ _id: storeId.toString() }, { syncStatus: '', status: 'live' }, { new: true });
                return res.status(200).json({success: false, message: "There was something happend"});
            }
        }

        // date range order import
        if(range){
            try{
                
                const {start, end} = JSON.parse(range);
                const result = await integrationController.fetchAll('orders', api, storeId, {after: start + 'T00:00:00', before: end + 'T23:59:59'})
                await ApiKey.findOneAndUpdate({ _id: storeId.toString() }, { syncStatus: '', status: 'live' }, { new: true });
                return res.status(200).json(result);
            } catch (error) {
                await ApiKey.findOneAndUpdate({ _id: storeId.toString() }, { syncStatus: '', status: 'live' }, { new: true });
                return res.status(200).json({success: false, message: "There was something happend"});
            }
        }
    }
}

async function processItems(productPriceMap, reqBody ) {
    let totalValue = 0;
    const count = {
        totalKeyCount: 0,
        stockAvailableCount: 0
    };
    const messages = {};
    const items = reqBody.items;
    for (const item of items) {
        if (item.meta_data._is_serial_number === 'yes' && item.meta_data._ac_serial_numbers_key_source === 'reseller') {
            const quantity = item.quantity || 1;
            const client_product_id = item.product_id;
            item.serialKeys = item.serialKeys || [];
            let totalForItem = 0;

            let remoteProducts = item.meta_data._ac_remote_product;
            if ( typeof remoteProducts === 'string' ){
                remoteProducts = JSON.parse(remoteProducts);
            }

            
            
            for (const remoteProduct of remoteProducts) {
                const productId = remoteProduct.id;
                const price = productPriceMap.get(productId) || 0;
                count.totalKeyCount += quantity;
                const keys = await storeController.getSerialKey(productId, client_product_id, quantity);
                if(keys.length === quantity){
                    totalForItem += price * quantity;
                    item.amount = totalForItem;
                    if(reqBody.status === 'processing' || reqBody.status === 'completed'){
                        item.serialKeys.push(...keys);
                    }
                    count.stockAvailableCount += quantity;
                }else{
                    messages.serialKey = "serialKey is not available";
                    messages.code = "5660";
                }
            }

            item.remote_products_total = totalForItem;
            totalValue += totalForItem;
        }
        
    }
    return {
        totalValue,
        count,
        messages
    };
}

module.exports = storeController;