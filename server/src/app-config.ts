import { parseLogLevel, parseOptionalNumber } from './utils/parse-utils';
import * as path from 'path';
import { LogLevel } from "./lib/logger";

export interface AppConfig {
    httpServer: {
        port: number;
        host: string;
        basePath: string,
    };
    fileRepository: {
        path: string;
        maxFileSizeInMB: number;
    };
    logging: {
        level: LogLevel;
    };
}

export const appConfig: AppConfig = {
    httpServer: {
        port: parseOptionalNumber(process.env.UPLOADER_SERVER_PORT) || 3001,
        host: process.env.UPLOADER_SERVER_HOST || 'localhost',
        basePath: '/api'
    },
    fileRepository: {
        path: process.env.UPLOADER_FILE_STORE_PATH || path.join(__dirname, '..', 'data'),
        maxFileSizeInMB: 500
    },
    logging: {
        level: parseLogLevel(process.env.LOGLEVEL) || 'debug'
    }
};
