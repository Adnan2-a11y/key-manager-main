module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    // TODO write your migration here.
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});

    const transactions = db.collection("transactions");

    const cursor = transactions.find();

    while (await cursor.hasNext()) {
        const doc = await cursor.next();

        let updatedOrderData = [];

        if (Array.isArray(doc.orderData)) {
            updatedOrderData = doc.orderData.map(item => ({
                item_id: item.item_id || 0,
                product_id: item.product_id || 0,
                variantion_id: item.variantion_id || 0,
                name: item.name || "",
                op_id: item.op_id || null,
                cp_id: item.cp_id || 0,
                quantity: item.quantity || 1,
                subtotal: item.subtotal || 0,
                total: item.total || 0,
                amount: item.amount || 0,
                tax: item.tax || 0,
                reason: item.reason || "",
                error_code: item.error_code || 0,
                serialKeys: item.serialKeys || [],
                meta_data: item.meta_data || {
                    total_sales: 0,
                    _manage_stock: "no",
                    _backorders: "no",
                    _sold_individually: "no",
                    _virtual: "no",
                    _downloadable: "no",
                    _download_limit: 0,
                    _download_expiry: 0,
                    _stock: "",
                    _stock_status: "instock",
                    _wc_average_rating: 0,
                    _wc_review_count: 0,
                    _product_version: "1.0.0",
                    _regular_price: "0",
                    _sale_price: "0",
                    _price: "0",
                    _is_serial_number: "no",
                    _serial_key_source: "custom_source",
                    _ac_remote_product: []
                }
            }));
        }

        await transactions.updateOne(
            { _id: doc._id },
            {
                $set: {
                    orderData: updatedOrderData,
                    total: doc.total || 0,
                    subtotal: doc.subtotal || 0,
                    total_tax: doc.total_tax || 0,
                    total_discount: doc.total_discount || 0,
                    total_shipping: doc.total_shipping || 0,
                    total_fee: doc.total_fee || 0,
                    currency: doc.currency || "USD",
                    order_note: doc.order_note || "",
                    locale: doc.locale || "en_US",
                    payment_method: doc.payment_method || "",
                    payment_method_title: doc.payment_method_title || "",
                    transaction_date: doc.transaction_date || new Date(),
                    total_shipping_tax: doc.total_shipping_tax || 0,
                    total_shipping_discount: doc.total_shipping_discount || 0,
                    error_messages: doc.error_messages || {
                        user: "",
                        customer_first_name: "",
                        customer_last_name: "",
                        customer_email: "",
                        serialKey: "",
                        balance: "",
                        code: "",
                    },
                }
            }
        );
    }

    console.log("Migration completed ✅");

    module.exports.down = async function (db, client) {
        // Optional: define how to roll back the above migration
        console.log("Rollback not implemented.");
    };

  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
