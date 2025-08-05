import { createLogger, transports, format } from 'winston';
import fs from 'fs';
import path from 'path';
import DailyRotateFile from 'winston-daily-rotate-file';
import { environment, logDirectory } from '../config';

let dir = logDirectory;
if (!dir) dir = path.resolve('logs');

// Try to create directory if it is not present, but don't fail if we can't
let canWriteLogs = false;
try {
  if (!fs.existsSync(dir)) {
    // Create the directory if it does not exist
    fs.mkdirSync(dir, { recursive: true });
  }
  // Test if we can write to the directory
  const testFile = path.join(dir, '.test');
  fs.writeFileSync(testFile, 'test');
  fs.unlinkSync(testFile);
  canWriteLogs = true;
} catch (error: any) {
  console.warn(
    `Warning: Cannot write to logs directory ${dir}:`,
    error.message,
  );
  canWriteLogs = false;
}

const logLevel = environment === 'development' ? 'debug' : 'warn';

// Create console transport
const consoleTransport = new transports.Console({
  level: logLevel,
  format: format.combine(format.errors({ stack: true }), format.prettyPrint()),
});

// Create transports array starting with console
const transportsArray: any[] = [consoleTransport];

// Only add file transport if we can write to logs
if (canWriteLogs) {
  const dailyRotateFile = new DailyRotateFile({
    level: logLevel,
    // @ts-ignore
    filename: dir + '/%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    handleExceptions: true,
    maxSize: '20m',
    maxFiles: '14d',
    format: format.combine(
      format.errors({ stack: true }),
      format.timestamp(),
      format.json(),
    ),
  });

  transportsArray.push(dailyRotateFile);
}

export default createLogger({
  transports: transportsArray,
  exceptionHandlers: transportsArray,
  exitOnError: false, // do not exit on handled exceptions
});
