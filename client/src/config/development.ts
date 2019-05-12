import { Config } from './config';

const oneMiBInBytes = 1024 * 1024;

export const developmentConfig: Config = {
    baseApiURI: '/api/v1',
    upload: {
        chunkSizeInBytes: oneMiBInBytes,
        simultaneousChunkAmount: 4,
        chunkRetryIntervalInMs: 3000,
        maxChunkRetries: 30
    }
};
