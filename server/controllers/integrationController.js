const { request } = require("http");
const ApiKey = require("../database/apiKeyDB");
const User = require("../database/userDB");
const { randomBytes } = require("crypto");
const { getHostname, isValidUrl } = require("../utils/Helper");
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;
const mongoose = require('mongoose');
const { logToFile } = require("../utils/SaveLogs");
const Customer = require("../database/customerDB");
const Transaction = require("../database/transactions");

const integrationController = {
    generateApiKey: async (req, res) => {
      try {
        // Generate a new API key
        const apiKey = randomBytes(32).toString("hex"); // 64-character hex string
        const { name } = req.body;
        const userId = req.user._id;
        
        // find the limit        
        const totalApiKeys = await ApiKey.find({ userId: userId }).countDocuments();
        if (req.user.role === "user" && totalApiKeys >= 5) {
          return res.status(400).json({ message: "You have reached the limit of 5 API keys. Please contact support if you need more or delete an existing one first then try again." });
        }

        // Check if API key name already exists
        const existingApiKey = await ApiKey.findOne({ userId: userId, name: name });
        console.log("existingApiKey", existingApiKey);
        if (existingApiKey) {
          return res.status(400).json({ message: "API key name already exists for this site. Use another website or edit the existing one" });
        }
        // Create a new API key document
        const newApiKey = new ApiKey({
            userId: userId,  // Reference to User
            name: name,
            key: apiKey,
        });

        // Save the API key to the database
        await newApiKey.save();

        // Update the User model to store the reference
        await User.findByIdAndUpdate(userId, {
            $push: { apiKeys: newApiKey._id },
        });

        console.log("API Key created successfully:", newApiKey);
        // return newApiKey;
        return res.status(200).json({
          success: true,
          message: "API key generated successfully",
          apiKey,
          name,
          status: newApiKey.status
        });
      } catch (error) {
        console.error("Error creating API key:", error);
        return res.status(500).json({ error: "Error fetching the API key", message: error.message });
      }
    },

    deleteApiKey: async (req, res) => {
      try {
        const { apiKeyId } = req.body;
        const userId = req.user._id; // Access user ID from req.user
        // Step 1: Delete the API key from the ApiKey collection
        const deletedApiKey = await ApiKey.findOneAndDelete({ _id: apiKeyId, userId: userId });
        
        if (!deletedApiKey) {
            console.log("API Key not found");
            return res.status(404).json({ success: false, message: "API Key not found" });
        }

        // Step 2: Remove the reference from the User model
        await User.findByIdAndUpdate(userId, {
            $pull: { apiKeys: apiKeyId },
        });

        console.log("API Key deleted successfully");
        return res.status(200).json({ success: true, message: "API Key deleted successfully" });
      } catch (error) {
          console.error("Error deleting the API Key:", error);
          return res.status(500).json({ error: "Error deleting the API Key", message: error.message });
      }
    },

    viewApiKeyById: async (req, res) => {
        try {
        //   const { name } = req.body;
          const { id } = req.params;
          const userId = req.user._id; // Access user ID from req.user
    
          // Find the user
          const user = await User.findById(userId);
          if (!user) {
            return res.status(404).json({ message: "User not found" });
          }
    
          // Find the API key
          const apiKey = await ApiKey.findOne({ _id: id, userId: userId });
    
          return res.status(200).json({ apiKey });
        } catch (error) {
          console.error("Error fetching the API key:", error);
          return res.status(500).json({ error: "Error fetching the API key", message: error.message });
        }
    },

    viewAllApiKey: async (req, res) => {
        try {
          const userId = req.user._id; // Access user ID from req.user
    
          // Find the user
          const user = await User.findById(userId)
          .populate({
            path: "apiKeys",
          }).exec();

          if (!user) {
            return res.status(404).json({ message: "User not found" });
          }
    
          return res.status(200).json({
            apiKeys: user.apiKeys
          });
        } catch (error) {
          console.error("Error fetching API keys:", error);
          return res.status(500).json({ error: "Error fetching API keys", message: error.message });
        }
    },

    changeApiKeyStatus: async (req, res) => {
        try {
          const { id } = req.params;
          const { name, auth_key, status } = req.body;
          const userId = req.user._id; // Access user ID from req.user
    
          // Find the user
          const user = await User.findById(userId);
          if (!user) {
            return res.status(404).json({ message: "User not found" });
          }
    
          const apiKey = await ApiKey.findOne({ _id: id, userId: userId });
          apiKey.name = name || apiKey.name;
          apiKey.status = status || apiKey.status;
          apiKey.webhook_key = auth_key;
          await apiKey.save();
    
          return res.status(200).json({ message: "API key status updated successfully" });  
        } catch (error) {
          console.error("Error updating the API key:", error);
          return res.status(500).json({ error: "Error updating the API key", message: error.message });
        }
    },
    connectStore: async (req, res) => {
      const {store_url} = req.body;

      if (store_url === '') return res.status(200).json({success: false, message: "Store URL is required"});
     
      const userId = req.user._id; // your internal user id

      if (!userId) return res.status(200).json({success: false, message: "User not found"});

      // find the limit        
      const totalApiKeys = await ApiKey.find({ userId: userId }).countDocuments();
      if (req.user.role === "user" && totalApiKeys >= 5) {
        return res.status(400).json({ message: "You have reached the limit of 5 API keys. Please contact support if you need more or delete an existing one first then try again." });
      }

      if(!isValidUrl(store_url)){
        return res.status(400).json({ message: "Please enter a valid URL e.g: https://www.example.com" });
      }

      const site_name = getHostname(store_url);
      const existingApiKey = await ApiKey.findOne({ userId: userId, name: site_name });
      if (existingApiKey) {
        return res.status(400).json({ message: "API key name already exists for this site. Use another website or edit the existing one" });
      }
      const apiKey = randomBytes(32).toString("hex");
      // Create a new API key document
      const newApiKey = new ApiKey({
          userId: userId,  // Reference to User
          name: site_name,
          siteUrl: store_url,
          key: apiKey,
      });

      // Save the API key to the database
      const savedApiKey = await newApiKey.save();


      
      const params = new URLSearchParams({
        app_name: 'TIC Key Manager',
        scope: 'read_write',
        user_id: savedApiKey._id,
        return_url: process.env.NODE_ENV === 'production' ? `https://keys.tic.com.bd/api-keys` : `https://front.dinjob.com/api-keys`,
        callback_url: process.env.NODE_ENV === 'production' ? 'https://keys.tic.com.bd/api/integration/connect-store-callback' : 'https://server.dinjob.com/api/integration/connect-store-callback',
        
      });
    
      const redirectUrl = `${store_url}/wc-auth/v1/authorize?${params.toString()}`;
    
      return res.status(200).json({
        success: true,
        message: "Store saved as pending",
        authorized_url: redirectUrl

      });
    },
    saveStoreKeys: async(req, res) => {
      const {user_id, consumer_key, consumer_secret } = req.body;
      if(!user_id || !consumer_key  || !consumer_secret) {
        return res.status(404).json({success: false, message: "Data maybe missing required params"});
      }

      // find the limit        
      const apiId = mongoose.isObjectIdOrHexString(user_id) ? mongoose.Types.ObjectId.createFromHexString(user_id) : null;
      const existingKey = await ApiKey.findOneAndUpdate(
        { _id: apiId },
        { consumerKey: consumer_key, consumerSecret: consumer_secret },
        { new: true } // Returns the updated document
      );

      if (existingKey) {
        await User.findByIdAndUpdate(existingKey.userId, {
            $push: { apiKeys: existingKey._id },
        });
        res.status(200).send('OK');
        await integrationController.startSync({ query: { store: existingKey._id } });
      } else {
        return res.status(404).json({success: false, message: "No existing API key found for this user"});
      }      
    },
    startSync: async(req = '', res = '') => {

      const { store, page } = req.query;
      const { _id: storeId, name, siteUrl, consumerKey, consumerSecret } = await ApiKey.findById(store);
      
      try {
        const apiData = await ApiKey.findOne({ _id: storeId });
        console.log(`::-> [⏳] Sync started at ${new Date().toISOString()}`);
        if (apiData?.syncStatus){
          return res ? res.status(200).json({success: true, message: {status: 'pending', message: "Store data synchorization already started"}}) : console.log(`::-> [✅] Sync started at ${new Date().toISOString()}`);
        }
        await ApiKey.findOneAndUpdate({ _id: storeId.toString() }, { syncStatus: 'Store data synchorization started', status: 'pending' }, { new: true });
        try{
          const api = new WooCommerceRestApi({
            url: siteUrl ?? `https://${name}`,
            consumerKey: consumerKey,
            consumerSecret: consumerSecret,
            version: 'wc/v3',
            queryStringAuth: true
          });

          res ? res.status(200).json({success: true, message: {status: 'pending', message: "Store data synchorization started"}}) : console.log(`::-> [✅] Sync started at ${new Date().toISOString()}`);
  
          await integrationController.fetchAll('customers', api, storeId, {page});
          await integrationController.fetchAll('orders', api, storeId, {page})
          
          // After all data synced status should be live
          await ApiKey.findOneAndUpdate({ _id: storeId.toString() }, { syncStatus: '', status: 'live' }, { new: true });
        } catch (error) {
          console.log("error", error.message)
        }        
      } catch (error){
        return res ? res.status(404).json({success: false, message: error.message}) : console.log("startSyncError:", error.message);
      }
    },
    fetchSingleEndpoint: async (req, res) => {
      const { store, endpoint, page } = req.query;
      const { _id: storeId, name, siteUrl, consumerKey, consumerSecret } = await ApiKey.findById(store);
      
      try {
        const apiData = await ApiKey.findOne({ _id: storeId });
        console.log(`::-> [⏳] Sync started at ${new Date().toISOString()}`);
        if (apiData?.syncStatus){
          return res ? res.status(200).json({success: true, message: {status: 'pending', message: "Store data synchorization already started"}}) : console.log(`::-> [✅] Sync started at ${new Date().toISOString()}`);
        }
        await ApiKey.findOneAndUpdate({ _id: storeId.toString() }, { syncStatus: 'Store data synchorization started', status: 'pending' }, { new: true });
        try{
          const api = new WooCommerceRestApi({
            url: siteUrl ?? `https://${name}`,
            consumerKey: consumerKey,
            consumerSecret: consumerSecret,
            version: 'wc/v3',
            queryStringAuth: true
          });

          res ? res.status(200).json({success: true, message: {status: 'pending', message: "Store data synchorization started"}}) : console.log(`::-> [✅] Sync started at ${new Date().toISOString()}`);

        await integrationController.fetchAll(endpoint, api, storeId, page);

        await ApiKey.findOneAndUpdate({ _id: storeId.toString() }, { syncStatus: '', status: 'live' }, { new: true });

        } catch (error) {
          console.log("error", error.message)
        }        
      } catch (error){
        return res ? res.status(404).json({success: false, message: error.message}) : console.log("startSyncError:", error.message);
      }
    },
    syncStatus: async (req, res) => {
      try {
        const { storeId } =  req.query;
        const apiData = await ApiKey.findOne({ _id: storeId });
        console.log("apiData", apiData.syncStatus);
        return res.status(200).json({success: true, message: {status: apiData?.status, message: apiData?.syncStatus}});
      } catch (error) {
        return res.status(404).json({success: false, message: error.message});
      }
    },
    fetchAll: async (endpoint, api, storeId, config = {}) => {
      let hasMore = true;
      const baseConfig = { per_page: 100, page: 1, ...config };

      try {
        console.log(`::-> Started fetching ${endpoint}`);
        await ApiKey.findOneAndUpdate({ _id: storeId.toString() }, { syncStatus: `Now fetching ${endpoint}`, status: 'pending' }, { new: true });
        while (hasMore) {
          let data;
          let success = false;

          // Retry loop for the same page
          while (!success) {
            try {
              const response = await api.get(endpoint, baseConfig);
              data = response.data;
              success = true;
            } catch (error) {
              console.error(`[-] Retrying page ${baseConfig.page} for ${endpoint}:`, error.response?.data || error.message);
              await new Promise(resolve => setTimeout(resolve, 2000)); // Retry delay
            }
          }

          if (data.length > 0) {
            await integrationController.saveToDatabase(endpoint, data, storeId);
          
            console.log(`::-> fetchAll ${endpoint}: Saved page ${baseConfig.page}`);
            await ApiKey.findOneAndUpdate({ _id: storeId.toString() }, { syncStatus: `Fetching ${endpoint}: Saved page no ${baseConfig.page}`, status: 'pending' }, { new: true });

            baseConfig.page++;
          }else{
            hasMore = false;
            console.log(`::-> fetchAll Completed ${endpoint}`);
          }    
    
          // Delay between pages (to avoid API rate limits)
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        await ApiKey.findOneAndUpdate({ _id: storeId.toString() }, { lastSyncedAt: new Date().toISOString() }, { new: true });

        return { success: true, message: "Sync finished successfully"};
      } catch (error) {
        console.error(`[-] Failed to fetch ${endpoint}:`, error.response?.data || error.message, storeId);
      }
    },
    saveToDatabase: async(endpoint, data, storeId) => {

        if ('customers' === endpoint){
          if(data.length === 0 ) return;

          console.log("::-> saveToDatabase: inserting customers", data.length);

          for (const customer of data) {
            try{
              const email = customer.email?.toLowerCase().trim();
              await Customer.create({
                first_name: customer?.first_name || customer?.billing?.first_name || '',
                last_name: customer?.last_name || customer?.billing?.last_name || '',
                phone: customer?.phone,
                email: email,
                username: customer?.username || '',
                address: customer?.billing?.address_1 || '',
                city: customer?.billing?.city || '',
                state: customer?.billing?.state || '',
                zip: customer?.billing?.postcode || '',
                country: customer?.billing?.country || '',
              });
              
            }catch(e){
              console.log("saveToDatabase: customer", e.message)
            }
          }
        }

        if ('orders' === endpoint){
          
          if(data.length === 0 ) return;

          console.log("::-> saveToDatabase: inserting orders", data.length);

          for (const order of data) {
            try{
              const email =  order?.billing?.email;
              let customer = await Customer.findOne({email});
              console.log("existing customer", customer?._id.toString(), order.status);
              if (!customer) {
                console.log("not found existing customer");
                customer = await Customer.create({
                  first_name: order.billing?.first_name ?? '',
                  last_name: order.billing?.last_name ?? '',
                  email: email,
                  phone: order.billing?.phone ?? '',
                  address: order.billing?.address ?? '',
                  city: order.billing?.city ?? '',
                  state: order.billing?.state ?? '',
                  zip: order.billing?.postcode ?? '',
                  country: order.billing?.country ?? '',
                  isGuest: true

                })
                console.log("New customer", customer._id.toString(), order.status);
              }
              const line_items = order.line_items.map(item => ({
                name: item.name,
                cp_id: Number.parseFloat(item.product_id),
                quantity: Number.parseFloat(item.quantity),
                subtotal: Number.parseFloat(item.subtotal) || 0,
                total: Number.parseFloat(item.total) || 0,
              }));
              const coupon_lines = order.coupon_lines.map(item => ({
                code: item.code,
                discount: Number.parseFloat(item.discount) || 0,
                amount: item.nominal_amount || 0,
                type: item.discount_type,
              }));

              try{
                const existingOne = await Transaction.findOne({ invoice_no: order?.id, siteId: storeId });
                if(existingOne){
                  await Transaction.updateOne({
                    invoice_no: order?.id,
                    siteId: storeId,
                  },
                  {
                    invoice_no: order?.id,
                    customerId: customer?._id,
                    transactionType: 'order',
                    transactionAmount: 0,
                    transactionStatus: order.status,
                    siteId: storeId,
                    // orderData: line_items,
                    coupon: coupon_lines,
                    currency: order.currency,
                    order_note: order.customer_note,
                    payment_method: order.payment_method,
                    payment_method_title: order.payment_method_title,
                    discount_total: Number.parseFloat(order.total_discount) || 0,
                    total: Number.parseFloat(order.total) || 0,
                    total_fee: Number.parseFloat(order.total_fee) || 0,
                    transactionSource: 'system',
                    transaction_date: order.date_created,
                    createdAt: order.date_created,
                    updatedAt: order.date_created,
                  });
                }else{
                  await Transaction.create({
                    invoice_no: order?.id,
                    customerId: customer?._id,
                    transactionType: 'order',
                    transactionAmount: 0,
                    transactionStatus: order.status,
                    siteId: storeId,
                    orderData: line_items,
                    coupon: coupon_lines,
                    currency: order.currency,
                    order_note: order.customer_note,
                    payment_method: order.payment_method,
                    payment_method_title: order.payment_method_title,
                    discount_total: Number.parseFloat(order.total_discount) || 0,
                    total: Number.parseFloat(order.total) || 0,
                    total_fee: Number.parseFloat(order.total_fee) || 0,
                    transactionSource: 'system',
                    transaction_date: order.date_created,
                    createdAt: order.date_created,
                    updatedAt: order.date_created,
                  });
                }
              } catch(err) {
                if (err.code === 11000) {
                  console.log("Duplicate transaction, skipping insert", order?.id);
                } else {
                  console.log("saveToDatabase: inserting order", err.message);
                }
              }
              
            } catch(error) {
              console.log(" : order", error.message);
            }
          }         

        }

    },
    fetchSingleOrder: async () => {}
}

module.exports = integrationController