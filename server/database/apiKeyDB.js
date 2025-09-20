const mongoose = require("mongoose");

const apiKeySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    key: { type: String, required: true, unique: true },
    webhook_key: { type: String },
    siteUrl: { type: String },
    consumerKey: { type: String },
    consumerSecret: { type: String },
    lastSyncedAt: { type: Date },
    telegramChatId: { type: String },
    status: { type: String, enum: ["test", "live", "disabled", "pending"], default: "pending" },
    syncStatus: String,
}, { timestamps: true, versionKey: false });

const ApiKey = mongoose.model("ApiKey", apiKeySchema);
module.exports = ApiKey;