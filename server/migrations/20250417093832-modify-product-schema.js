module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    await db.collection("products").updateMany(
      {}, // Match all documents
      {
        $unset: { sku: "" }, // Remove the sku field
        $set: { purchasePrice: 0 } // Add purchasePrice field with default value
      }
    );
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    await db.collection("products").updateMany(
      {},
      {
        $set: { sku: "" }, // Restore sku field (empty string or whatever default you want)
        $unset: { purchasePrice: "" } // Remove purchasePrice field
      }
    );
  }
};
