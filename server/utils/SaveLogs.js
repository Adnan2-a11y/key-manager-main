const fs = require('fs');
const path = require('path');

exports.logToFile = (message, type = 'app', title = '') => {
	const logsDirectory = path.join(__dirname, '../logs');
	const logFilePath = path.join(logsDirectory, type + '.log');

	// Create the 'logs' directory if it doesn't exist
	if (!fs.existsSync(logsDirectory)) {
		fs.mkdirSync(logsDirectory);
	}

	// Create a timestamp for the log entry
	const timestamp = new Date().toISOString();

  // Extract stack trace for line number and file info
  const stack = new Error().stack;
  const callerLine = stack.split('\n')[2]; // Caller is usually on the third line
  const match = callerLine.match(/at\s+(.*):(\d+):(\d+)/);
  const locationInfo = match ? `${match[1]}:${match[2]}` : 'unknown location';

	// Create the log entry
	const logEntry = `${timestamp} [${locationInfo}]: ${title !== '' ? `[${title}]::` : ''} ${safeStringify(message)}\n`;

	// Append the log entry to the file
	fs.appendFile(logFilePath, logEntry, (err) => {
		if (err) {
			console.error('Error writing to log file:', type);
		} else {
			console.log('Log entry written to file:', type);
		}
	});
}

function safeStringify(obj) {
	const seen = new WeakSet();
	return JSON.stringify(obj, function (_, value) {
		if (typeof value === 'object' && value !== null) {
			if (seen.has(value)) {
				return '[Circular]';
			}
			seen.add(value);
		}
		return value;
	});
}