import { developmentConfig } from './development';
import { productionConfig } from './production';

export interface Config {
    baseApiURI: string;
    upload: {
        chunkSizeInBytes: number
        simultaneousChunkAmount: number
        chunkRetryIntervalInMs: number,
        maxChunkRetries: number
    };
}

export const config = process.env.REACT_APP_ENV === 'production' ? productionConfig : developmentConfig;
