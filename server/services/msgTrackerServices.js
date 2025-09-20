const MSGTrack = require("../database/messageTrackerDB");

const msgTrackerService = {
    create: async (start, end, siteId, chatId) => {
        try{
            if (start && end && siteId){
                const now = new Date();
                const currentMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
                const isExists = await MSGTrack.exists({
                    start,
                    end,
                    siteId,
                    currentMonth
                });
                if (!isExists) {
                    await MSGTrack.create({
                        start,
                        end,
                        siteId,
                        currentMonth,
                        chatId,
                        isNotified: chatId ? true : false,
                    });
                }
            }
        } catch (error) {
            console.log("msgTrackerService.create", error.message);
        }
    },
    isNotified: async (start, end, siteId) => {
        try {
            if(start && end && siteId){
                const now = new Date();
                const currentMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
                const response = await MSGTrack.findOne({
                    start,
                    end,
                    siteId,
                    currentMonth
                });
                return response;
            }else{
                return false;
            }

        } catch (error) {
            console.log("msgTrackerService.isNotified", error.message);
        }
    },
}

module.exports = msgTrackerService;