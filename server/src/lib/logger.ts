import * as winston from 'winston';
import {format} from 'logform';

export type Logger = winston.Logger;
export type LogLevel = 'debug' | 'verbose' | 'info' | 'warn' | 'error';



const alignedWithColorsAndTime = format.combine(
    format.colorize(),
    format.timestamp(),
    format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
);

const transports = [
    new winston.transports.Console({format: alignedWithColorsAndTime})
];

const rootLogger = winston.createLogger({
    transports
});

export function setLogLevel(level: string): void {
    transports.forEach(transport => transport.level = level);
    console.log(`(Logging messages with level "${level}" and above)`);
}

export function getLogger(name: string): Logger {
    return rootLogger.child(name);
}
