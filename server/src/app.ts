import { FileUploadService } from "./file-upload-service";
import { getLogger, setLogLevel } from "./utils/logger";
import { appConfig } from "./app-config";

const fileUploadService = new FileUploadService();

const logger = getLogger('main');

main().catch(uncaughtErrorHandler);

async function main() {
    try {
        setLogLevel(appConfig.logging.level);
        setupSignalHandlers(fileUploadService);
        await fileUploadService.start(appConfig);
    } catch (error) {
        uncaughtErrorHandler(error);
    }
}

function setupSignalHandlers(service: FileUploadService) {
    process.on('SIGINT', async function () {
        logger.info('< INTERRUPT SIGNAL RECEIVED >');
        try {
            await service.stop('interrupt signal received');
            process.exit(0);
        } catch {
            process.exit(1);
        }
    });
}

function uncaughtErrorHandler(err: any) {
    console.error(`Exiting due to unhandled error:`, err);
    process.exit(1);
}
