import * as winston from 'winston';
import { format, TransformableInfo } from 'logform';

export type Logger = winston.Logger;
export type LogLevel = 'debug' | 'verbose' | 'info' | 'warn' | 'error';

const simpleFormatter = (info: TransformableInfo) => `${info.timestamp} ${info.level} ${info.message}`;
const verboseFormatter = (info: TransformableInfo) => `${info.timestamp} ${info.level} [${info.component}] ${info.message}`;

const consoleFormat = format.combine(
    format.align(),
    format.timestamp(),
    format.colorize(),
    format.printf(simpleFormatter)
);

const fileFormat = format.combine(
    format.timestamp(),
    format.printf(verboseFormatter)
);

const transports = [
    new winston.transports.Console({format: consoleFormat}),
    new winston.transports.File({ format: fileFormat, filename: 'logs/server.log' })

];

const rootLogger = winston.createLogger({
    transports
});

export function setLogLevel(level: string): void {
    transports.forEach(transport => transport.level = level);
    console.log(`(Logging messages with level "${level}" and above)`);
}

export function getLogger(name: string): Logger {
    return rootLogger.child({ component: name });
}
