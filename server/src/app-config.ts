import { parseOptionalNumber } from './utils/parse-utils';
import * as path from 'path';

export interface AppConfig {
    httpServer: {
        port: number;
        host: string;
    };
    fileRepository: FileRepositoryConfig;
    logging: {
        level: string;
    };
}

export interface FileRepositoryConfig {
    path: string;
    maxFileSizeInMB: number;
}

export const appConfig: AppConfig = {
    httpServer: {
        port: parseOptionalNumber(process.env.UPLOADER_SERVER_PORT) || 3001,
        host: process.env.UPLOADER_SERVER_HOST || 'localhost'
    },
    fileRepository: {
        path: process.env.UPLOADER_FILE_STORE_PATH || path.join(__dirname, '..', 'data'),
        maxFileSizeInMB: 500
    },
    logging: {
        level: process.env.LOGLEVEL || 'debug'
    }
};
