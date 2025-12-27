import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOG_DIR = path.join(__dirname, '../logs');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR);
}

const writeLog = (filename, message) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    fs.appendFileSync(path.join(LOG_DIR, filename), logMessage);
};

export const logger = {
    info: (message) => {
        console.log(`[INFO] ${message}`);
        writeLog('info.log', message);
    },
    error: (message, stack = '') => {
        console.error(`[ERROR] ${message} ${stack}`);
        writeLog('error.log', `${message} ${stack}`);
    },
    transaction: (type, data) => {
        const message = `TRANSACTION [${type}]: ${JSON.stringify(data)}`;
        console.log(message);
        writeLog('transactions.log', message);
    }
};
