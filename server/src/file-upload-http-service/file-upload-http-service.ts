import { addApiEndpointsToExpressServer, HttpRequestContextFactory } from "../utils/express-api";
import { getLogger } from "../utils/logger";
import { FileRepository } from "../file-repository/file-repository";
import { fileUploadHttpEndpoints } from "./http-endpoints";
import { StateTracker } from "../utils/state-tracker";
import { Express } from "express";
import { RequestContext } from "./request-context";

export enum ServiceState {
    STOPPED = 'STOPPED',
    INITIALIZING = 'INITIALIZING',
    RUNNING = 'RUNNING',
    STOPPING = 'STOPPING'
}

const logger = getLogger('FileUploadService');

export interface DependencyInjector {
    getExpress(): Promise<Express>;
    getFileRepository(): Promise<FileRepository>;
    maximumFileSizeInBytes?: number;
}

export class FileUploadHttpService {
    private state: StateTracker<ServiceState> = new StateTracker(ServiceState.STOPPED, logger);
    private httpServer: Express | null = null;
    private fileRepository: FileRepository | null = null;
    private contextFactory: HttpRequestContextFactory<RequestContext> | null = null;

    public async start(injector: DependencyInjector): Promise<void> {
        this.state.assert(ServiceState.STOPPED, `Cannot start the service while service state is ${this.state.get()}`);
        try {
            await this.state.set(ServiceState.INITIALIZING);

            this.httpServer = await injector.getExpress();
            this.fileRepository = await injector.getFileRepository();
            this.contextFactory = this.createContextFactory(this.fileRepository, injector.maximumFileSizeInBytes);

            addApiEndpointsToExpressServer(this.httpServer, {
                endpoints: fileUploadHttpEndpoints,
                apiVersion: 1,
                contextFactory: this.contextFactory
            });
            await this.fileRepository.initialize();

            this.state.set(ServiceState.RUNNING);
        } catch (err) {
            await this.stop('Fatal error during initialization');
            throw err;
        }
    }

    public async stop(reason: string) {
        logger.info(`Service shutdown requested (reason: ${reason}).`);
        await this.state.set(ServiceState.STOPPING);

        if (this.fileRepository) await this.fileRepository.cleanup();

        await this.state.set(ServiceState.STOPPED);
    }

    private createContextFactory(fileRepository: FileRepository, maxFileSizeInBytes?: number): HttpRequestContextFactory<RequestContext> {
        return async () => ({
            fileRepository,
            maximumFileSizeInBytes: maxFileSizeInBytes
        });
    }
}
