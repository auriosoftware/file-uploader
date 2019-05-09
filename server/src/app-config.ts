import { parseOptionalNumber } from "./utils/parse-utils";

export interface AppConfig {
    httpServer: {
        port: number;
        host: string;
    },
    fileStore: FileStoreConfig;
    logging: {
        level: string;
    }
}

export type FileStoreConfig = LocalFileStoreConfig;

export type LocalFileStoreConfig = {
    type: 'local_directory',
    path: string,
}

export const appConfig : AppConfig = {
    httpServer: {
        port: parseOptionalNumber(process.env.UPLOADER_SERVER_PORT) || 3001,
        host: process.env.UPLOADER_SERVER_HOST || 'localhost',
    },
    fileStore: {
        type: 'local_directory',
        path: process.env.UPLOADER_FILE_STORE_PATH || './data',
    },
    logging: {
        level: process.env.LOGLEVEL || 'debug',
    }
};
