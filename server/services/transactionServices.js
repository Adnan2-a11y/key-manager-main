const Transaction = require("../database/transactions");

const transactionService = {

    getSummaryBySiteId: async(startDay = false, endDay = false) => {
        try {
            // console.log(startDay.toDate(), endDay);
            if (!startDay && !endDay){
              return;
            }

            const pipelineBySiteId = [
              {
                $match: {
                  transaction_date: {
                    $gte: startDay,
                    $lte: endDay
                  },
                  transactionStatus: { $in: ['complete', 'completed', 'partial', 'processing', 'failed', 'pending'] }
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
                $group: {
                  _id: "$siteId",
                  telegramChatId: { $first: "$apiKey.telegramChatId" },
                  transactions: { $push: "$$ROOT" },
                  count: { $sum: 1 },
                  totalAmount: { $sum: "$total" } // optional, adjust field name
                }
              },
              {
                $project: {
                    telegramChatId: 1,
                    count: 1,
                    totalAmount: 1
                }
              }
            ]

            const result = await Transaction.aggregate(pipelineBySiteId);
            // console.log("getSummaryBySiteId", result);

            return result;
            
        } catch (error) {
            console.log("getSummaryBySiteId", error.message);
        }
    }
}

module.exports = transactionService;