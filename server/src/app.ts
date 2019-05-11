import { FileUploadHttpService } from './file-upload-http-service/file-upload-http-service';
import { getLogger, setLogLevel } from './utils/logger';
import { appConfig } from './app-config';
import { ExpressHttpServer } from './utils/express-http-server';
import { FileSystemRepository } from './file-repository/file-system-repository';
import { getErrorDetails } from './utils/errors';
import { megaBytesToBytes } from './file-upload-http-service/endpoint-handlers/handlers/upload-file';

const logger = getLogger('main');
const fileUploadService = new FileUploadHttpService();
const httpServer = new ExpressHttpServer(appConfig.httpServer);

main().catch(uncaughtErrorHandler);

async function main() {
    try {
        setLogLevel(appConfig.logging.level);
        setupSignalHandlers();

        await fileUploadService.start({
            maximumFileSizeInBytes: megaBytesToBytes(appConfig.fileRepository.maxFileSizeInMB),
            getExpress: async () => httpServer.getExpress(),
            getFileRepository: async () => new FileSystemRepository(appConfig.fileRepository.path)
        });

        httpServer.listen();
    } catch (error) {
        uncaughtErrorHandler(error);
    }
}

function setupSignalHandlers() {
    process.on('SIGINT', async function () {
        logger.info('< INTERRUPT SIGNAL RECEIVED >');
        try {
            await gracefulShutdown('interrupt signal');
            process.exit(0);
        } catch {
            process.exit(1);
        }
    });
}

function uncaughtErrorHandler(error: any) {
    console.error(`Exiting due to unhandled error:`, error);
    gracefulShutdown('unhandled error')
        .catch((shutdownError) => {
            console.error(`Graceful shutdown failed (${getErrorDetails(shutdownError)})`);
        })
        .finally(() => process.exit(1));
}

async function gracefulShutdown(reason: string) {
    await fileUploadService.stop(reason);
    await httpServer.close();

}
