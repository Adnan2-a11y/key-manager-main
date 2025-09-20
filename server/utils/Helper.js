const axios = require("axios");
const { logToFile } = require("./SaveLogs");
const Product = require("../database/product/productDB");
const ApiKey = require("../database/apiKeyDB");

const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const getAPIKeyId = (userData, searchKey) => {
    const apiKey = userData.apiKeys.find(item => item.key === searchKey);
    return apiKey ? apiKey._id : null;
}

const sendOrderDataToClient = async (apiData) => {
    try {
        const scheme = process.env.NODE_ENV === "production" ? "https" : "http";
        const siteUrl =  process.env.NODE_ENV === "production" ? apiData.siteId.name : "shop-tic.local";
        const baseUrl = `${scheme}://${siteUrl}`;

        console.log("target", process.env.NODE_ENV, scheme, siteUrl, baseUrl);

        const webhookResponse = await axios.post(`${baseUrl}/wp-json/ac-serial-numbers/v1/webhook`, apiData, {
            headers: {
                "X-Webhook-Secret": apiData.siteId?.webhook_key || "",
            },
        });
        return webhookResponse;
    } catch (error) {
        logToFile(error, "newOrder");
        return error;
    }
}
const sendUpdatedOrderDataToClient = async (orderData, apiData) => {
    try {
        const scheme = process.env.NODE_ENV === "production" ? "https" : "http";
        const siteUrl =  process.env.NODE_ENV === "production" ? apiData.siteId.name : "shop-tic.local";
        const baseUrl = `${scheme}://${siteUrl}`;

        const webhookResponse = await axios.post(`${baseUrl}/wp-json/ac-serial-numbers/v1/order/update`, orderData, {
            headers: {
                "X-Webhook-Secret": apiData.siteId?.webhook_key || "",
            },
        });
        return webhookResponse;
    } catch (error) {
        logToFile(error, "newOrder");
        return error;
    }
}

const sendUpdatedStockDataToClient = async () => {
    try {
        const apiData = await ApiKey.find().select("name webhook_key");

        if (!apiData || apiData.length === 0) {
            console.log("No sites found in database");
            return;
        }

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
            
        // Return the products
        const stockData = {
            counts: products.length,
            products: products,
        }

        for (const site of apiData) {
            if (!site.name || !site.webhook_key) {
                console.log(`Skipping site ${site._id} - missing name or webhook key`);
                continue;
            }

            const baseUrl = `https://${site.name}`;
            const endpoint = `${baseUrl}/wp-json/ac-serial-numbers/v1/stock/update`;

            try {
                console.log(`Updating stock for ${site.name}...`);
                // 3. Make the API call
                const response = await axios.post(endpoint, stockData, {
                    headers: {
                        "X-Webhook-Secret": site.webhook_key,
                    },
                    timeout: 5000 // 5 second timeout
                });
                console.log(`Successfully updated ${site.name}:`, response.status);
            } catch (error) {
                // 4. Handle specific error cases
                if (error.response) {
                    // Server responded with error status
                    console.error(`Error updating ${site.name}:`, {
                        status: error.response.status,
                        data: error.response.data
                    });
                } else if (error.request) {
                    // No response received
                    console.error(`No response from ${site.name}:`, error.message);
                } else {
                    // Other errors
                    console.error(`Error processing ${site.name}:`, error.message);
                }
            }

            // 5. Optional delay between requests to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay
        }
        console.log("Finished processing all sites");
        return "Finished processing all sites";
    } catch (error) {
        console.error("Critical error in updateAllSitesStock:", error);
        return error;
    }
}

const determineOrderHasCompleted = async (transaction) => {
    if (!transaction){
        return false;
    }
    let notFulfilledCount = 0;
    transaction.orderData.map(item => {
        const requestedQty = item.quantity * item.meta_data._ac_remote_product.length;
        const serialKeysCount = item.serialKeys.length;
        if(requestedQty !== serialKeysCount) {
            notFulfilledCount++;
        }

    });

    // if notFulfilledCount is higher than 0,
    // That means this transaction is partial
    if (notFulfilledCount > 0){ 
        return false;
    }else{
        return true;
    }
}
const isValidUrl = (userInput) => {
    try {
      new URL(userInput);
      return true;
    } catch (err) {
      return false;
    }
  }
const getHostname = (url) => {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.hostname;
    } catch (error) {
      // Handle invalid URL format
      console.error("Invalid URL:", error);
      return null;
    }
  }

module.exports = { 
    isValidEmail,
    getAPIKeyId,
    sendOrderDataToClient,
    sendUpdatedOrderDataToClient,
    determineOrderHasCompleted,
    sendUpdatedStockDataToClient,
    getHostname,
    isValidUrl
};