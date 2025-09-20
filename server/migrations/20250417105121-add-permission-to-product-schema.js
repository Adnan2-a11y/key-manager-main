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
        $set: { permission: "" } // Add purchasePrice field with default value
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
      {}, // Match all documents
      {
        $unset: { permission: "" } // Add purchasePrice field with default value
      }
    );
  }
};
