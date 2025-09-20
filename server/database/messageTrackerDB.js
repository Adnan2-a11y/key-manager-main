const mongoose = require("mongoose");
const msgTrackerSchema = new mongoose.Schema({
    siteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ApiKey'
    },
    chatId: String,
    start: Number,
    end: Number,
    currentMonth: String,
    isNotified: {
        type: Boolean,
        default: true
    }
},
{
    versionKey: false,
    timestamps: true
});

msgTrackerSchema.index({ start: 1, end: 1, siteId: 1, currentMonth: 1 },{ unique: true });

const MSGTrack = mongoose.model("MSGTrack", msgTrackerSchema);
module.exports = MSGTrack;