
const ApiKey = require("../database/apiKeyDB");
const Transaction = require("../database/transactions");
const moment = require("moment");
const { logToFile } = require("../utils/SaveLogs");
const Customer = require("../database/customerDB");
const serialNumberController = require("./serialNumberController");
const Product = require("../database/product/productDB");
const productController = require("./productController");
const transactionService = require("../services/transactionServices");

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const customParseFormat = require('dayjs/plugin/customParseFormat');
const msgTrackerService = require("../services/msgTrackerServices");
const { sendUpdatedStockDataToClient } = require("../utils/Helper");
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

const telegramBotController = {
    sendNewOrderToMerchant : async (transaction) => {
      try {        
        const { customerId, siteId, invoice_no, total, transactionAmount, transactionStatus, createdAt, orderData } = transaction;
        const apiData = await ApiKey.findOne({ _id: siteId });
        if(!apiData){
          return 'Merchant apiData not found';
        }

        const { name: website, telegramChatId } = apiData;
        const existingCustomer = await Customer.findById(customerId);

        const requested_products = orderData.map(item => item.name).join(', ');
        if (telegramChatId){
          const orderMessage = `🆕 Merchant: New Order Received!` +
                `\n🌐 Website: ${website}` +
                `\n🆔 Order ID: #${invoice_no}` +
                `\n💵 Admin Price: $${transactionAmount}` +
                `\n💵 Reseller Price: $${total}` +
                `\n⏰ Time: ${new Date(createdAt * 1000)}` + 
                `\n🖥️ Product: ${requested_products}` +
                `\n📧 Email: ${existingCustomer?.email}` +
                `\n🔄 Status: ${transactionStatus}`;

          await telegramBotController.sendNewOrder({
            chatId: telegramChatId,
            text: orderMessage,
  
            parse_mode: "Markdown",
          });
          return 'Merchant notified successfully via ' + telegramChatId;
        }else{
          return 'Merchant telegramChatId not found';
        }
      } catch (error) {
        return error.message;
      }
    },
    sendNewOrderToReseller : async (transaction) => {
      try {
        
        const { customerId, siteId, invoice_no, total, transactionAmount, transactionStatus, createdAt, orderData } = transaction;
        const apiData = await ApiKey.findOne({ _id: siteId }).populate('userId');
        if(!apiData){
          return 'Reseller apiData not found';
        }

        const { name: website, userId } = apiData;
        const existingCustomer = await Customer.findById(customerId);
        const requested_products = orderData.map(item => item.name).join(', ');
        const telegramChatId = userId?.profile?.resellerChatId;
        if (telegramChatId){
          const message = await telegramBotController.getStockStatusByTransaction(transaction);
          const orderMessage = `🆕 Reseller: New Order Received!` +
                `\n🌐 Website: ${website}` +
                `\n🆔 Order ID: #${invoice_no}` +
                `\n💵 Admin Price: $${transactionAmount}` +
                `\n💵 Reseller Price: $${total}` +
                `\n⏰ Time: ${new Date(createdAt * 1000)}` + 
                `\n🖥️ Product: ${requested_products}` +
                `\n📧 Email: ${existingCustomer?.email}` +
                `\n🔄 Status: ${transactionStatus}` +
                `\n\n${message}`;

          await telegramBotController.sendNewOrder({
            chatId: telegramChatId,
            text: orderMessage,  
            parse_mode: "Markdown",
          });
          return 'Reseller notified successfully via ' + telegramChatId;
        }else{
          return 'Reseller telegramChatId not found';
        }
      } catch (error) {
        return error.message;
      }
    },
    sendNewOrderToAdmin : async (transaction) => {
      try {
        
        const { customerId, siteId, invoice_no, total, transactionAmount, transactionStatus, createdAt, orderData } = transaction;
        const apiData = await ApiKey.findOne({ _id: siteId });
        if(!apiData){
          return 'Admin apiData not found';
        }

        const { name: website } = apiData;
        const existingCustomer = await Customer.findOne({ _id: customerId });

        const requested_products = orderData.map(item => item.name).join(', ');

        // this is admin chat
        const telegramChatId = process.env.TELEGRAM_ADMIN_ID;
        if (telegramChatId){
          await telegramBotController.sendNewOrder({
            chatId: telegramChatId,
            text: `🆕 Admin: New Order Received!` +
                `\n🌐 Website: ${website}` +
                `\n🆔 Order ID: #${invoice_no}` +
                `\n💵 Admin Price: $${transactionAmount}` +
                `\n💵 Reseller Price: $${total}` +
                `\n⏰ Time: ${new Date(createdAt * 1000)}` + 
                `\n🖥️ Product: ${requested_products}` +
                `\n📧 Email: ${existingCustomer?.email}` +
                `\n🔄 Status: ${transactionStatus}`,
  
            parse_mode: "Markdown",
          });
          return 'Admin notified successfully via ' + telegramChatId;
        }else{
          return 'Admin telegramChatId not found';
        }
      } catch (error) {
        return error.message;
      }
    },
    getStockStatusByTransaction: async(transaction) => {
      const { orderData } = transaction;

      const productIds = orderData.flatMap(item =>
        item.meta_data._ac_remote_product.map(el => el)
      );

      const result = await serialNumberController.stockByProductIds(productIds);
      let message = '';
      if(result.length > 0){
        message += '🏠 Stock Status 🏠';
        for(let i = 0; i < result.length; i++){
          const proData = await Product.findById(result[i].id);
          message +=  `\n🔢 Keys: ${result[i].count} ${result[i].count < 5 ? '⚠️' : ' ✅'}` +
          `\n🧾 ID: ${proData?.productId}\n`;
        }
        return message;
      }
    },
    getTotalStockStatus: async(chatId = false) => {

      const result = await productController.lowStocksAll();
      const telegramChatId = chatId || process.env.TELEGRAM_ADMIN_ID;
      let message = '';
      // console.log(result.success, result.counts, result.success && result.counts > 0);
      if(result.success && result.counts > 0){
        message += '⚠️ *Low Stock Alert*\n';
        for(let i = 0; i < result.counts; i++){
          const line = `${i+1}. ${result.products[i].productName} (Qty: ${result.products[i].availableKeys})\n`;
          if((message + line).length > 4000){
            if (telegramChatId){
              await telegramBotController.sendNewOrder({
                chatId: telegramChatId,
                text: message,
                parse_mode: "Markdown",
              });
            }
            message = '';
          }
          message +=  line;
        }
      }


      if (telegramChatId){
        await telegramBotController.sendNewOrder({
          chatId: telegramChatId,
          text: message,
          parse_mode: "Markdown",
        });
      }
    },
    notifyTest: async( req, res) => {

      const { action, role, transactionId, date, chatId = false } = req.body;

      if(action === 'newsale'){
        const transaction = await Transaction.findById(transactionId);
        if(role === 'admin'){          
          await telegramBotController.sendNewOrderToAdmin(transaction);
        }
        if(role === 'reseller'){
          await telegramBotController.sendNewOrderToReseller(transaction);          
        }
        if(role === 'merchant'){
          await telegramBotController.sendNewOrderToMerchant(transaction);
        }
      }

      if(action === 'summary'){
        const now = dayjs().tz('Asia/Dhaka');
        let startDay = now.startOf('day');
        let endDay = now.endOf('day');
        if (date){
          startDay = dayjs(date, 'DD-MM-YYYY').startOf('day');
          endDay = dayjs(date, 'DD-MM-YYYY').endOf('day');
        }

        const promises = [];

        if (role === 'admin') {
          console.log('admin summary')
          promises.push(telegramBotController.sendSummaryToAdmin(startDay, endDay));
        }
        
        if (role === 'reseller') {
          console.log('reseller summary')
          promises.push(telegramBotController.sendSummaryToReseller(startDay, endDay));
        }
        if (role === 'merchant') {
          console.log('merchant summary')
          promises.push(telegramBotController.sendSummaryToMerchant(startDay, endDay));
        }

        promises.push(telegramBotController.getTotalStockStatus(chatId));

        await Promise.all(promises);
      }

      if(action === 'congrats'){
        await telegramBotController.sendCongratMessage(date, chatId);
      }

      return res.status(200).json({message: "asdasdasd"});
    },
    stockNotifyTest: async( req, res ) => {
      try {
        const response = await sendUpdatedStockDataToClient();
        return res.status(200).json({success: true, message: "Successfully notified!", response});
      } catch (error) {
        return res.status(500).json({success: false, message: error.message});
      }
    },
    
    // Do not touch it, this is the main telegram function
    sendNewOrder: async (data) => {
        try {
  
          const { chatId, text, parseMode } = data
          const token = process.env.TELEGRAM_API;
          if (!token) {
            return "Token not found";
          }
          if (!chatId) {
            return "Chat ID not found";
          }
          await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              chat_id: chatId,
              text: text,
              parseMode: parseMode
            })
          })

          return "Message sent successfully";
            
        } catch (error) {
            return "Error sending message: " + error.message;
        }
    },
    sendSummaryToMerchant: async (startDay = false, endDay = false) => {
        try {

            if (!startDay && !endDay){
              return;
            }

            const orders  = await transactionService.getSummaryBySiteId(startDay.toDate(), endDay.toDate());
            if (orders .length === 0) {
              return;
            }            
            const sites  = await ApiKey.find().select('telegramChatId');

            const orderMap = new Map();
            orders.forEach(order => {
              if (order.telegramChatId) {
                orderMap.set(order.telegramChatId, order);
              }
            });

            for (const site of sites) {
              if (!site.telegramChatId) continue; // Skip sites without chat ID
              
              const order = orderMap.get(site.telegramChatId);
              const hasSales = order !== undefined;
              
              const count = hasSales ? order.count : 0;
              const totalAmount = hasSales ? order.totalAmount : 0;
              
              const message = 
                `📊 *Daily Sales Summary*\n\n` +
                `🛒 Orders: *${count}*\n` +
                `💰 Total Revenue: *$${totalAmount.toFixed(2)}*\n\n` +
                (hasSales ? `✅ Sales recorded` : `ℹ️ No sales today`);
              
              try {
                await telegramBotController.sendNewOrder({chatId: site.telegramChatId, text: message, parseMode: 'Markdown'})
                console.log(`Summary sent to ${site.telegramChatId}`);
              } catch (error) {
                console.error(`Failed to send to ${site.telegramChatId}:`, error);
              }
            }
        } catch (error) {
            console.log("sendSummaryToMerchant", error.message);
            return false;
        }
    },
    sendSummaryToReseller: async (startDay = false, endDay = false) => {
        try {
          if (!startDay && !endDay){
            return;
          }

          const pipelineByUserId = [
            {
              $match: {
                createdAt: {
                  $gte: startDay.toDate(),
                  $lte: endDay.toDate()
                },
                transactionStatus: { $in: ['complete', 'partial', 'processing', 'failed'] }
              }
            },
            {
              $lookup: {
                from: "apikeys",
                localField: "siteId",
                foreignField: "_id",
                as: "apiKey"
              }
            },
            { $unwind: "$apiKey" },
            {
              $lookup: {
                from: "users",
                let: { userId: "$apiKey.userId" },
                pipeline: [
                  {
                    $match: { $expr: { $eq: ["$_id", "$$userId"] } }
                  },
                  {
                    $project:  {
                      _id: 1,
                      resellerChatId: "$profile.resellerChatId"
                    }
                  }
                ],
                as: "user"
              }
            },
            { $unwind: "$user" },
            {
              $group: {
                _id: "$apiKey.userId",
                resellerChatId: { $first: "$user.resellerChatId" },
                transactions: { $push: "$$ROOT" },
                count: { $sum: 1 },
                totalAmount: { $sum: "$total" } // optional
              }
            }
          ];

          const result = await Transaction.aggregate(pipelineByUserId);
          
          if (result.length === 0) {
            return;
          }

          // now we need to loop result and send data to telegram

          for (let index = 0; index < result.length; index++) {
            const element = result[index];
            const { resellerChatId, count, totalAmount } = element;
            const message = `📊 Reseller Daily Order Summary (Today)` +
              `\n\n📦 Total Orders: ${count}` +
              `\n💰 Total Revenue: $${totalAmount.toFixed(2)}` +
              `\n\n🕙 Date: ${moment(startDay.toDate()).format('MMMM Do YYYY')}`;

            await telegramBotController.sendNewOrder({chatId: resellerChatId, text: message, parseMode: 'Markdown'})
          }
        } catch (error) {
            console.log("sendSummaryToMerchant", error.message);
        }
    },
    sendSummaryToAdmin: async (startDay = false, endDay = false) => {
        try {
          if (!startDay && !endDay){
            return;
          }

          const adminChatId = process.env.TELEGRAM_ADMIN_ID;
          const orders = await Transaction.find({
              createdAt: { 
                  $gte: startDay.toDate(),
                  $lte: endDay.toDate()
              },
              transactionStatus: { $in: ['complete', 'partial', 'processing', 'failed'] }
          });
      
          const totalSum = orders.reduce((total, order) => {
          return total + order.total;
          }, 0);

          const message = `📊 Admin Daily Order Summary (Today)` + 
          `\n\n📦 Total Orders: ${orders.length}` + 
          `\n💰 Total Revenue: $${totalSum.toFixed(2)}` +
          `\n\n🕙 Date: ${moment(startDay.toDate()).format('MMMM Do YYYY')}`;

          if(adminChatId){
            await telegramBotController.sendNewOrder({chatId: adminChatId, text: message, parseMode: 'Markdown'})
          }
        } catch (error) {
            console.log("sendSummaryToAdmin", error.message);
        }
    },
    sendCongratMessage: async (date, chatId = false) => {
      try {

        const now = dayjs().tz('Asia/Dhaka');
        let startOfMonth = now.startOf('month');
        let currentDay = now.endOf('day');
        if (date){
          startOfMonth = dayjs(date, 'DD-MM-YYYY').startOf('month');
          currentDay = dayjs(date, 'DD-MM-YYYY').endOf('day');
        }
        // const startDay = now.date(currentDay - 1).startOf('day');

        const result = await transactionService.getSummaryBySiteId(startOfMonth.toDate(), currentDay.toDate());

        if (result.length === 0) {
          return;
        }

        // now we need to loop result and send data to telegram
        for (let index = 0; index < result.length; index++) {
          const element = result[index];
          const { telegramChatId, count, totalAmount, _id } = element;
          
          if (totalAmount >= 100 && totalAmount < 500) {
            const isNotified = await msgTrackerService.isNotified(100, 500, _id);
            if(!isNotified){
              const message = `🎉 Congratulations! 🎉` +
                `\n\nYou've achieved $${totalAmount.toFixed(2)} in total sales! 🚀` +
                `\n\nKeep up the great work and aim for the next milestone!`;
    
              await telegramBotController.sendNewOrder({chatId: chatId || telegramChatId, text: message, parseMode: 'Markdown'})
              await msgTrackerService.create(100, 500, _id, telegramChatId);
            }


          } else if (totalAmount >= 500 && totalAmount < 1000){
            const isNotified = await msgTrackerService.isNotified(500, 1000, _id);
            if(!isNotified){
              const message = `🥳 Amazing job 🥳` +
                `\n\nYou've reached $${totalAmount.toFixed(2)} in total sales! 🌟` +
                `\n\nYour dedication is paying off. Let's keep the momentum going!`;
    
              await telegramBotController.sendNewOrder({chatId: chatId || telegramChatId, text: message, parseMode: 'Markdown'})
              await msgTrackerService.create(500, 1000, _id, telegramChatId);
            }
          } else if (totalAmount >= 1000 && totalAmount < 1500){
            const isNotified = await msgTrackerService.isNotified(1000, 1500, _id);
            if(!isNotified){
              const message = `🏆 Outstanding Achievement 🏆` +
                `\n\nYou've surpassed $${totalAmount.toFixed(2)} in total sales! 🎯` +
                `\n\nYour commitment and hard work are truly commendable. Here's to continued success!`;
    
              await telegramBotController.sendNewOrder({chatId: chatId || telegramChatId, text: message, parseMode: 'Markdown'})
              await msgTrackerService.create(1000, 1500, _id, telegramChatId);
            }
          } else if (totalAmount >= 1500 && totalAmount < 2000){
            const isNotified = await msgTrackerService.isNotified(1500, 2000, _id);
            if(!isNotified){
              const message = `🥂 Cheers to You 🥂` +
                `\n\nYou've achieved $${totalAmount.toFixed(2)} in total sales! 🚀` +
                `\n\nYour dedication is truly inspiring. Keep reaching for new heights!`;
    
              await telegramBotController.sendNewOrder({chatId: chatId || telegramChatId, text: message, parseMode: 'Markdown'})
              await msgTrackerService.create(1500, 2000, _id, telegramChatId);
            }

          } else if (totalAmount >= 2000 && totalAmount < 2500){
            const isNotified = await msgTrackerService.isNotified(2000, 2500, _id);
            if(!isNotified){
              const message = `🎯 Target Achieved, [Reseller Name]! 🎯` +
                `\n\n$${totalAmount.toFixed(2)} in sales and climbing! 📈` +
                `\n\nYour consistent effort is making a significant impact. Onward and upward!`;
    
              await telegramBotController.sendNewOrder({chatId: chatId || telegramChatId, text: message, parseMode: 'Markdown'})
              await msgTrackerService.create(2000, 2500, _id, telegramChatId);
            }

          } else if (totalAmount >= 2500 && totalAmount < 3000){
            
          } else if (totalAmount >= 3000 && totalAmount < 3500){
            const isNotified = await msgTrackerService.isNotified(3000, 3500, _id);
            if(!isNotified){
              const message = `🏅 Champion Status Unlocked, [Reseller Name]! 🏅` +
                `\n\n$${totalAmount.toFixed(2)} in total sales! 🏆` +
                `\n\nYour exceptional performance sets a new standard. Congratulations on this remarkable achievement!`;
    
              await telegramBotController.sendNewOrder({chatId: chatId || telegramChatId, text: message, parseMode: 'Markdown'})
              await msgTrackerService.create(3000, 3500, _id, telegramChatId);
            }
          } else if (totalAmount >= 3500 && totalAmount < 4000){

          } else if (totalAmount >= 4000 && totalAmount < 4500){

          } else if (totalAmount >= 4500 && totalAmount < 5000){

          } else {

          }
        }


      } catch (error) {
        console.log("sendCongatMessege", error.message)
      }
    },
}

module.exports = telegramBotController