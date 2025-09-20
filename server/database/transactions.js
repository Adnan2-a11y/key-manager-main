const mongoose = require("mongoose");
const RemoteProductSchema = new mongoose.Schema({
    id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
    },
    text: String 
}, { _id: false });
  
const MetaDataSchema = new mongoose.Schema({
    total_sales: Number,
    _manage_stock: String,
    _backorders: String,
    _sold_individually: String,
    _virtual: String,
    _downloadable: String,
    _download_limit: Number,
    _download_expiry: Number,
    _stock: String, // or Number or Mixed
    _stock_status: String,
    _wc_average_rating: Number,
    _wc_review_count: Number,
    _product_version: String,
    _regular_price: mongoose.Schema.Types.Mixed, // Could be Number or String
    _sale_price: mongoose.Schema.Types.Mixed,
    _price: mongoose.Schema.Types.Mixed,
    _is_serial_number: String,
    _ac_serial_numbers_key_source: String,
    _ac_remote_product: [RemoteProductSchema]
}, { _id: false });

const OrderDataSchema = new mongoose.Schema({
    item_id: Number,
    product_id: Number,
    variantion_id: Number,
    name: String,
    op_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
    },
    cp_id: Number,
    quantity: Number,
    subtotal: Number,
    total: Number,
    amount: Number,
    tax: Number,
    reason: String,
    error_code: Number,
    meta_data: MetaDataSchema,
    serialKeys: [
        {
            type: mongoose.Schema.Types.Mixed,
        }
    ]
}, { _id: false, strict: false });

const couponSchema = new mongoose.Schema({
    code: String,
    discount: Number,
    amount: Number,
    type: String
  }, { _id: false });

const transactionSchema = new mongoose.Schema({
    transactionId: {
        type: Number,
        unique: true,
    },
    invoice_no: Number,
    total: Number,
    subtotal: Number,
    total_tax: Number,
    total_discount: Number,
    total_shipping: Number,
    total_fee: Number,
    currency: String,
    order_note: String,
    locale: String,
    payment_method: String,
    payment_method_title: String,
    transaction_date: {
        type: Date,
        default: Date.now,
    },
    total_shipping: Number,
    total_shipping_tax: Number,
    total_shipping_discount: Number,
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
    },
    transactionType: String,
    transactionAmount: Number,
    transactionDescription: String,
    transactionSource: String,
    transactionStatus: {
        type: String,
        default: "completed"
    },
    coupon: [couponSchema],
    
    siteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ApiKey",
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    orderData: [OrderDataSchema],
    error_messages: {
        user: String,
        customer_first_name: String,
        customer_last_name: String,
        customer_email: String,
        serialKey: String,
        balance: String,
        code: String,
        message: String
    },

},
{
    timestamps: true,
    versionKey: false
});

transactionSchema.pre("save", async function (next) {
    try {
        if (!this.transactionId) {
            const maxTranx = await Transaction.findOne().sort({ transactionId: -1 }).exec();
            this.transactionId = maxTranx ? maxTranx.transactionId + 1 : 1;
        }
        next();
    } catch (err) {
        console.log(err);
        return next(err);
    }
});

transactionSchema.index({ siteId: 1, invoice_no: 1 }, { unique: true });

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;