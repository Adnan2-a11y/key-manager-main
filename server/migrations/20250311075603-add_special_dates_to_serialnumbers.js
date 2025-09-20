module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    await db.collection("serialnumbers").updateMany(
      {},
      {
        $set: { purchaseDate: "", warrantyDate: "" },
      }
    );
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    await db.collection("serialnumbers").updateMany(
      {},
      {
        $unset: { purchaseDate: "", warrantyDate: "" },
      }
    );
  }
};
