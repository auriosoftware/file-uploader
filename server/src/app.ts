import { FileUploadHttpService } from './file-upload-http-service/file-upload-http-service';
import { getLogger, setLogLevel } from './lib/logger';
import { AppConfig, appConfigValidator } from './app-config';
import { ExpressHttpServer } from './lib/express-api/express-http-server';
import { FileSystemRepository } from './file-repository/file-system-repository';
import { getErrorDetails } from './lib/errors';
import { parse } from "./utils/parse-utils";
import * as path from "path";
import { megaBytesToBytes } from "./utils/conversion-utils";

main().catch((err) => {
    console.error('Error during initalization\n', err);
    process.exit(1);
});

async function main() {

    const configFile = path.resolve(`config/${process.env.NODE_ENV}.js`);
    console.info(`Using configuration ${configFile}`);
    const config: AppConfig = parse(require(configFile), appConfigValidator);

    const logger = getLogger('main');
    const fileUploadService = new FileUploadHttpService();
    const httpServer = new ExpressHttpServer(config.httpServer);

    try {
        setLogLevel(config.logging.level);
        setupSignalHandlers();

        await fileUploadService.start({
            maximumFileSizeInBytes: megaBytesToBytes(config.fileRepository.maxFileSizeInMB),
            apiBasePath: config.httpServer.basePath,
            getExpress: async () => httpServer.getExpress(),
            getFileUploadRepository: async () => new FileSystemRepository(config.fileRepository.fileUploadDirectory),
            getChunksRepository: async () => new FileSystemRepository(config.fileRepository.temporaryDirectory)
        });

        httpServer.listen();
    } catch (error) {
        uncaughtErrorHandler(error);
    }

    function setupSignalHandlers() {
        process.on('SIGINT', async function () {
            console.info('< INTERRUPT SIGNAL RECEIVED >');
            try {
                await gracefulShutdown('interrupt signal');
                process.exit(0);
            } catch {
                process.exit(1);
            }
        });
    }

    async function gracefulShutdown(reason: string) {
        await fileUploadService.stop(reason);
        await httpServer.close();
    }



    function uncaughtErrorHandler(error: any) {
        console.error(`Exiting due to unhandled error:`, error);
        gracefulShutdown('unhandled error')
            .catch((shutdownError) => {
                console.error(`Graceful shutdown failed (${getErrorDetails(shutdownError)})`);
            })
            .finally(() => process.exit(1));
    }

}


