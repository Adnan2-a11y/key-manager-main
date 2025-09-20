module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    await db.collection("apikeys").updateMany(
      {},
      {
        $set: { siteUrl: "", consumerKey: "", consumerSecret: "", lastSyncedAt: "" },
      }
    );
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    await db.collection("apikeys").updateMany(
      {},
      {
        $unset: { siteUrl: "", consumerKey: "", consumerSecret: "", lastSyncedAt: "" },
      }
    );
  }
};
