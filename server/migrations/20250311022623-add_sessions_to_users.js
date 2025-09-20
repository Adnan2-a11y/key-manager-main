module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    await db.collection("users").updateMany(
      {},
      {
        $unset: { token: "" }, // Remove `token`
        $set: { sessions: [] }, // Add empty `sessions` array
      }
    );
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    await db.collection("users").updateMany(
      {},
      {
        $set: { token: null }, // Add back `token` as null
        $unset: { sessions: "" }, // Remove `sessions`
      }
    );
  }
};
