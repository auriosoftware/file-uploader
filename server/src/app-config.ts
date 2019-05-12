import * as t from 'io-ts';

export const appConfigValidator = t.type({
    httpServer: t.type({
        port: t.number,
        host: t.string,
        basePath: t.string,
    }, 'httpServer'),
    fileRepository: t.type({
        fileUploadDirectory: t.string,
        temporaryDirectory: t.string,
        maxFileSizeInMB: t.number,
    }, 'fileRepository'),
    logging: t.type({
        level: t.string
    }, 'logging')
}, 'config');

export type AppConfig = t.TypeOf<typeof appConfigValidator>;
