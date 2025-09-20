const { CronJob } = require('cron');
const telegramBotController = require('../controllers/telegramBotController');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

const dailySalesNotifyJob = CronJob.from({
	// cronTime: '1/6 * * * * *', // every 10 seconds
	cronTime: '0 59 23 * * *', // 11:59 PM
	onTick: async function () {
		const now = dayjs().tz('Asia/Dhaka');
		const startDay = now.startOf('day');
		const endDay = now.endOf('day');

		await Promise.all([
			telegramBotController.sendSummaryToMerchant(startDay, endDay),
			telegramBotController.sendSummaryToReseller(startDay, endDay),
			telegramBotController.sendSummaryToAdmin(startDay, endDay),
			telegramBotController.getTotalStockStatus()
		]);

		const tomorrow = now.add(1, 'day').toDate();

		if (tomorrow.getDate() === 1) {

			const startOfMonth = now.startOf('month');         // 1st day of month at 00:00:00
			const endOfMonth = now.endOf('month');             // last day of month at 23:59:59.999

			console.log('Start of month:', startOfMonth.format()); // e.g., 2025-04-01T00:00:00+06:00
			console.log('End of month:', endOfMonth.format());     // e.g., 2025-04-30T23:59:59.999+06:00

			// If you need Date objects:
			const startDateofMonth = startOfMonth.toDate();
			const endDateofMonth = endOfMonth.toDate();

			// ✅ it's the last day of the month
			telegramBotController.sendSummaryToMerchant(startDateofMonth, endDateofMonth),
			telegramBotController.sendSummaryToReseller(startDateofMonth, endDateofMonth),
			telegramBotController.sendSummaryToAdmin(startDateofMonth, endDateofMonth)
		}
	},
	start: true,
	timeZone: 'Asia/Dhaka'
});

const congratsNotifyJob = CronJob.from({

	cronTime: '0 0 3,10,14,18,23 * * *', // 03:00 AM, 10:00 AM, 02:00 PM, 06:00 PM, 11:00 PM
	onTick: async function () {
		await telegramBotController.sendCongratMessage();
	},
	start: true,
	timeZone: 'Asia/Dhaka'
});

const weeklySalesNotifyJob = CronJob.from({
	// cronTime: '1/6 * * * * *',
	cronTime: '0 0 0 7,14,21 * *', // 11:59 PM
	onTick: async function () {
		const now = dayjs().tz('Asia/Dhaka');
		const startOfMonth = now.startOf('month'); 
		// const currentDay = now.date(); // 7, 14, 21, or 28

		// const startDay = now.date(currentDay - 6).startOf('day'); // go back 6 days
		const endDay = now.endOf('day'); // today 23:59:59.999

    	console.log('📦 Weekly summary:', startOfMonth.format(), '➡️', endDay.format());
        
		await Promise.all([
			telegramBotController.sendSummaryToMerchant(startOfMonth, endDay),
			telegramBotController.sendSummaryToReseller(startOfMonth, endDay),
			telegramBotController.sendSummaryToAdmin(startOfMonth, endDay)
		]);
	},
	start: true,
	timeZone: 'Asia/Dhaka'
});

// dailySalesNotifyJob.stop()
dailySalesNotifyJob.start()

congratsNotifyJob.start();

// weeklySalesNotifyJob.stop()
weeklySalesNotifyJob.start()