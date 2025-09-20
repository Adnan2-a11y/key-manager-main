const mongoose = require("mongoose");
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const customParseFormat = require('dayjs/plugin/customParseFormat');
const Transaction = require("../database/transactions");
const ApiKey = require("../database/apiKeyDB");
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);


const multiDashController = {
    summary: async(req, res) => {
        // const {parms} = req.params;
        // console.log(req.query);
        const { start, end } = req.query;

        const matchStage = {};
        const pipeline = [];

        // if(start && end) {
        //     const startDay = dayjs(start, 'YYYY-MM-DD').startOf('day');
        //     const endDay = dayjs(end, 'YYYY-MM-DD').endOf('day');
        //     matchStage.createdAt = {
        //         $gte: startDay.toDate(),
        //         $lte: endDay.toDate()
        //     }
        // }

        // matchStage.transactionStatus = "completed";

        pipeline.push({ $match: matchStage });
        pipeline.push({ $unwind: "$orderData" });
        
        pipeline.push({
            $addFields: {
                remoteProductCount: {
                    $size: {
                        $ifNull: ["$orderData.meta_data._ac_remote_product", []]
                    }
                },
                itemQuantity: "$orderData.quantity"
            }
        });
        pipeline.push({
            $addFields: {
                itemCount: {
                    $multiply: ["$remoteProductCount", "$itemQuantity"]
                }
            }
        });
        pipeline.push({
            $group: {
                _id: null,
                netRevenue: { $sum: "$total" },
                orders: { $addToSet: "$_id" }, // use _id to count unique transactions
                items: { $sum: "$itemCount" }
            }
        });
        pipeline.push({
            $project: {
                _id: 0,
                netRevenue: 1,
                ordersCount: { $size: "$orders" },
                items: 1,
                averageOrderNet: { $divide: ["$netRevenue", { $size: "$orders" }] },
                averageItems: { $divide: ["$items", { $size: "$orders" }] }
            }
        });

        try{
            const startDay = dayjs(start, 'YYYY-MM-DD').startOf('day');
            const endDay = dayjs(end, 'YYYY-MM-DD').endOf('day');

            // const resultee = await Transaction.aggregate(pipeline);
            const [result, stores] = await Promise.all([
                Transaction.aggregate([
                    {
                        $facet: {
                            summary: [
                                { 
                                    $match: { 
                                        transaction_date: {
                                            $gte: startDay.toDate(),
                                            $lte: endDay.toDate()
                                        },
                                        transactionStatus: {
                                            $in: ["complete", "completed", "partial", "processing"]
                                        }
                                    } 
                                },
                                { $unwind: "$orderData" },
                                {
                                    $addFields: {
                                        remoteProductCount: {
                                            $size: { $ifNull: ["$orderData.meta_data._ac_remote_product", []] }
                                        },
                                        itemQuantity: "$orderData.quantity"
                                    }
                                },
                                {
                                    $addFields: {
                                        itemCount: { $multiply: ["$remoteProductCount", "$itemQuantity"] }
                                    }
                                },
                                {
                                    $group: {
                                        _id: "$_id",
                                        total: { $first: "$total" },
                                        itemCount: { $sum: "$itemCount" }
                                    }
                                },
                                {
                                    $group: {
                                        _id: null,
                                        netRevenue: { $sum: "$total" },
                                        ordersCount: { $sum: 1 },
                                        items: { $sum: "$itemCount" }
                                    }
                                },
                                
                                {
                                    $project: {
                                        _id: 0,
                                        netRevenue: 1,
                                        ordersCount: 1,
                                        items: 1,
                                        averageOrderNet: { $divide: ["$netRevenue", "$ordersCount"] },
                                        averageItems: { $divide: ["$items", "$ordersCount"] }
                                    }
                                }
                            ],
                            customer: [
                                {
                                    $match: {
                                        transactionStatus: {
                                            $in: [
                                                "complete",
                                                "completd",
                                                "partial",
                                                "pending",
                                                "processing"
                                            ]
                                        }
                                    }
                                },
                                {
                                    $group: {
                                    _id: "$customerId",
                                        firstPurchaseDate: { $min: "$createdAt" }
                                    }
                                },
                                {
                                    $match: {
                                        firstPurchaseDate: {
                                            $gte: startDay.toDate(),
                                            $lte: endDay.toDate()
                                        }
                                    }
                                },
                                {
                                    $count: "newCustomers"
                                }
                            ],
                            statusCounts: [
                                {
                                    $match: {
                                    transaction_date: {
                                        $gte: startDay.toDate(),
                                        $lte: endDay.toDate()
                                    }
                                    }
                                },
                                {
                                    $group: {
                                        _id: "$transactionStatus",
                                        count: { $sum: 1 }
                                    }
                                }
                            ],
                            siteSummary: [
                                {
                                    $match: {
                                        transaction_date: {
                                            $gte: startDay.toDate(),
                                            $lte: endDay.toDate()
                                        },
                                        transactionStatus: {
                                            $in: ["complete", "completed", "partial", "processing"]
                                        }
                                    }
                                },
                                { $unwind: "$orderData" },
                                {
                                    $lookup: {
                                        from: 'apikeys',
                                        localField: 'siteId',
                                        foreignField: '_id',
                                        as: 'site'
                                    }
                                },
                                { $unwind: "$site" },
                                {
                                    $addFields: {
                                        remoteProductCount: {
                                            $size: {
                                            $ifNull: ["$orderData.meta_data._ac_remote_product", []]
                                            }
                                        },
                                        itemQuantity: "$orderData.quantity"
                                    }
                                },
                                {
                                    $addFields: {
                                        itemCount: {
                                            $multiply: ["$remoteProductCount", "$itemQuantity"]
                                        }
                                    }
                                },
                                {
                                    $group: {
                                        _id: "$_id",
                                        siteId: { $first: "$siteId" },
                                        total: { $first: "$total" },
                                        customerId: { $first: "$customerId" },
                                        itemCount: { $sum: "$itemCount" },
                                        site: { $first: '$site'}
                                    }
                                },



                                // Start of new customer counts
                                // Step 2: Join to find first ever transaction date for each customer
                                // {
                                //     $lookup: {
                                //         from: "transactions",
                                //         let: { customer: "$customerId" },
                                //         pipeline: [
                                //             {
                                //                 $match: {
                                //                     transactionStatus: {
                                //                         $in: [
                                //                             "complete",
                                //                             "partial",
                                //                             "pending",
                                //                             "processing"
                                //                         ]
                                //                     }
                                //                 }
                                //             },
                                //             {
                                //                 $match: {
                                //                     $expr: { $eq: ["$customerId", "$$customer"] }
                                //                 }
                                //             },
                                //             {
                                //                 $group: {
                                //                     _id: null,
                                //                     firstTransactionDate: { $min: "$transaction_date" }
                                //                 }
                                //             }
                                //         ],
                                //         as: "firstTransaction"
                                //     }
                                // },
                                // {
                                //     $unwind: "$firstTransaction"
                                // },

                                // Step 3: Mark new customer if their first transaction is within the current date range
                                {
                                    $addFields: {
                                        isNewCustomer: {
                                            $cond: [
                                                {
                                                    $and: [
                                                    { $gte: ["$firstTransaction.firstTransactionDate", startDay.toDate()] },
                                                    { $lte: ["$firstTransaction.firstTransactionDate", endDay.toDate()] }
                                                    ]
                                                },
                                                true,
                                                false
                                            ]
                                        }
                                    }
                                },

                                {
                                    // Group by siteId to aggregate all metrics
                                    $group: {
                                        _id: "$siteId",
                                        netRevenue: { $sum: "$total" },
                                        totalOrders: { $sum: 1 },
                                        totalItems: { $sum: "$itemCount" },
                                        uniqueCustomers: { $addToSet: "$customerId" },
                                        // newCustomersSet: {
                                        //     $addToSet: {
                                        //         $cond: ["$isNewCustomer", "$customerId", null]
                                        //     }
                                        // },
                                        site: {$addToSet: "$site"}
                                    }
                                },
                                { $unwind: "$site" },
                                {
                                    $project: {
                                        _id: 0,
                                        siteId: "$_id",
                                        netRevenue: 1,
                                        totalOrders: 1,
                                        totalItems: 1,
                                        // totalCustomers: { $size: "$uniqueCustomers" },
                                        // newCustomers: { $size: "$newCustomersSet" },
                                        site: {
                                            name: 1,
                                            siteUrl: 1,
                                            status: 1,
                                            syncStatus: 1,
                                            lastSyncedAt: 1
                                        },
                                        averageOrderNet: { $cond: [{ $eq: ["$totalOrders", 0] }, 0, { $divide: ["$netRevenue", "$totalOrders"] }] },
                                        averageOrderItems: { $cond: [{ $eq: ["$totalOrders", 0] }, 0, { $divide: ["$totalItems", "$totalOrders"] }] }
                                    }
                                }
                            ]
                        }
                    },                
                    {
                        $unwind: "$customer"
                    },
                    {
                        $project: {
                            summary: { $arrayElemAt: ["$summary", 0] },
                            statusCounts: 1,
                            siteSummary: 1,
                            customer: 1,

                        }
                    }
                ]),
                ApiKey.aggregate([
                    {
                        $match: {
                            userId: req.user._id
                        },
                    },
                    {
                        $project: {
                            key: 0,
                            webhook_key: 0,
                            consumerKey: 0,
                            consumerSecret: 0,
                        }
                    }
                ]),
            ]);

            return res.status(200).json({ success: true, message: "Ok", result: {
                summary: result[0],
                stores
            }});
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    },
};

module.exports = multiDashController;