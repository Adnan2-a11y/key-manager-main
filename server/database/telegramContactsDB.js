const mongoose = require("mongoose");
const telegramContactsSchema = new mongoose.Schema({
    chatId: String,
    title: String,
    local: String
},
{
    versionKey: false,
    timestamps: true
});

const TelegramContact = mongoose.model("TelegramContact", telegramContactsSchema);
module.exports = TelegramContact;