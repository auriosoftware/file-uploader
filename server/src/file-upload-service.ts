import { HttpActionContextFactory, HttpApiServer } from "./utils/http-api-server";
import { AppConfig } from "./app-config";
import { getLogger, setLogLevel } from "./utils/logger";
import { FileRepository } from "./domain/file-repository";
import { InMemoryFileRepository } from "./file-repository/in-memory-file-repository";
import { apiEndpoints } from "./http/http-endpoints";
import { AsyncEventBus } from "./utils/async-event-bus";

export enum ServiceState {
    STOPPED = 'STOPPED',
    INITIALIZING = 'INITIALIZING',
    RUNNING = 'RUNNING',
    STOPPING = 'STOPPING'
}

const logger = getLogger('FileUploadService');

export class FileUploadService {

    private currentConfig!: AppConfig;
    private state: ServiceState = ServiceState.STOPPED;

    private httpServer: HttpApiServer | null = null;
    private fileRepository: FileRepository = new InMemoryFileRepository();

    private stateEventBus = new AsyncEventBus<ServiceState>();

    private actionContextFactory: HttpActionContextFactory = async (request) => {
        if (this.state !== ServiceState.RUNNING) {
            throw new Error(`Service is currently not available.`);
        }

        return {
            fileStore: this.fileRepository
        }
    };

    public async start(appConfig: AppConfig): Promise<void> {
        this.assertStateIs(ServiceState.STOPPED, 'Cannot start the service.');
        try {
            setLogLevel(appConfig.logging.level);
            await this.transitionTo(ServiceState.INITIALIZING);

            this.currentConfig = appConfig;

            await this.initHttpServer();
            await this.fileRepository.initialize();

            logger.info(`HTTP server listening on ${appConfig.httpServer.host}:${appConfig.httpServer.port}.`);

            await this.transitionTo(ServiceState.RUNNING);
        } catch (err) {
            await this.stop('Fatal error during initialization');
            throw err;
        }
    }

    public async stop(reason: string) {
        logger.info(`Service shutdown requested (reason: ${reason}).`);
        await this.transitionTo(ServiceState.STOPPING);

        await this.shutdownHttpServer();
        await this.fileRepository.cleanup();

        await this.transitionTo(ServiceState.STOPPED);
    }

    private async initHttpServer(): Promise<void> {
        const cfg = this.currentConfig;
        this.httpServer = new HttpApiServer(this.actionContextFactory);
        this.httpServer.addEndpoints(apiEndpoints);
        await this.httpServer.listen(cfg.httpServer.host, cfg.httpServer.port);
    }

    private assertStateIs(expectedState: ServiceState, message: string) {
        if (this.state !== expectedState) {
            throw new Error(`${message} Operation allowed only when service state is ${expectedState} ` +
                `but current state is ${this.state}.`);
        }
    }

    private async transitionTo(newState: ServiceState) {
        logger.info(`${this.state} → ${newState}`);
        this.state = newState;
        await this.stateEventBus.fire(newState);
    }


    private async shutdownHttpServer(): Promise<void> {
        if (this.httpServer) {
            logger.debug(`Shutting down http server...`);
            await this.httpServer.shutdown();
        }
        return Promise.resolve();
    }

    public onState(state: ServiceState, listener: (state: ServiceState) => Promise<void>) {
        this.stateEventBus.registerListener(state, listener);
    }
}
