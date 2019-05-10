import { HttpActionContextFactory, HttpApiServer } from "./utils/http-api-server";
import { AppConfig } from "./app-config";
import { getLogger, setLogLevel } from "./utils/logger";
import { FileRepository } from "./action-context/file-repository";
import { InMemoryFileRepository } from "./file-repository/in-memory-file-repository";
import { apiEndpoints } from "./http/http-endpoints";
import { StateTracker } from "./utils/state-tracker";
import { FileSystemRepository } from "./file-repository/file-system-repository";

export enum ServiceState {
    STOPPED = 'STOPPED',
    INITIALIZING = 'INITIALIZING',
    RUNNING = 'RUNNING',
    STOPPING = 'STOPPING'
}

const logger = getLogger('FileUploadService');

export class FileUploadService {

    private currentConfig!: AppConfig;
    private state: StateTracker<ServiceState> = new StateTracker(ServiceState.STOPPED, logger);

    private httpServer: HttpApiServer | null = null;
    private fileRepository: FileRepository | null = null;

    private actionContextFactory: HttpActionContextFactory = async (request) => {
        this.state.assert(ServiceState.RUNNING, `Service is currently not available.`);

        return {
            fileRepository: this.fileRepository!
        }
    };

    public async start(appConfig: AppConfig): Promise<void> {
        this.state.assert(ServiceState.STOPPED, 'Cannot start the service.');
        try {
            setLogLevel(appConfig.logging.level);
            await this.state.set(ServiceState.INITIALIZING);

            this.currentConfig = appConfig;

            await this.initHttpServer();
            this.fileRepository = new FileSystemRepository(appConfig.fileRepository.path);
            await this.fileRepository.initialize();

            logger.info(`HTTP server listening on ${appConfig.httpServer.host}:${appConfig.httpServer.port}.`);

            this.state.set(ServiceState.RUNNING);
        } catch (err) {
            await this.stop('Fatal error during initialization');
            throw err;
        }
    }

    public async stop(reason: string) {
        logger.info(`Service shutdown requested (reason: ${reason}).`);
        await this.state.set(ServiceState.STOPPING);

        await this.shutdownHttpServer();
        if (this.fileRepository) await this.fileRepository.cleanup();

        await this.state.set(ServiceState.STOPPED);
    }

    private async initHttpServer(): Promise<void> {
        const cfg = this.currentConfig;
        this.httpServer = new HttpApiServer(this.actionContextFactory);
        this.httpServer.addEndpoints(apiEndpoints);
        await this.httpServer.listen(cfg.httpServer.host, cfg.httpServer.port);
    }

    private async shutdownHttpServer(): Promise<void> {
        if (this.httpServer) {
            logger.debug(`Shutting down http server...`);
            await this.httpServer.shutdown();
        }
        return Promise.resolve();
    }
}
