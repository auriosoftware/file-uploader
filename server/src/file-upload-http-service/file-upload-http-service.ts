import { getLogger } from '../lib/logger';
import { FileRepository } from '../file-repository/file-repository';
import { fileUploadHttpEndpoints } from './http-endpoints';
import { StateTracker } from '../lib/state-tracker';
import { Express } from 'express';
import { RequestContext } from './request-context';
import { ServiceNotAvailableError } from "../lib/errors";
import { ChunkedFilesAssembler } from "../chunked-files-assembler/chunked-files-assembler";
import { HttpRequestContextFactory, registerEndpointsOnExpressServer } from "../lib/express-api/express-register-endpoints";
import { appConfig } from "../app-config";

export enum ServiceState {
    STOPPED = 'STOPPED',
    INITIALIZING = 'INITIALIZING',
    RUNNING = 'RUNNING',
    STOPPING = 'STOPPING'
}

const logger = getLogger('FileUploadService');

export interface DependencyInjector {
    maximumFileSizeInBytes?: number;
    apiBasePath: string;

    getExpress(): Promise<Express>;

    getFileRepository(): Promise<FileRepository>;
}

export class FileUploadHttpService {
    private state: StateTracker<ServiceState> = new StateTracker(ServiceState.STOPPED, logger);
    private httpServer: Express | null = null;
    private fileRepository: FileRepository | null = null;
    private requestContextFactory: HttpRequestContextFactory<RequestContext> | null = null;
    private chunkedFilesAssembler: ChunkedFilesAssembler | null = null;

    public async start(injector: DependencyInjector): Promise<void> {
        this.state.assert(ServiceState.STOPPED, `Cannot start the service while service state is ${this.state.get()}`);
        try {
            await this.state.set(ServiceState.INITIALIZING);

            this.httpServer = await injector.getExpress();
            this.fileRepository = await injector.getFileRepository();
            this.chunkedFilesAssembler = new ChunkedFilesAssembler(this.fileRepository);
            this.requestContextFactory = this.createRequestContextFactory(injector);

            registerEndpointsOnExpressServer(this.httpServer, {
                endpoints: fileUploadHttpEndpoints,
                contextFactory: this.requestContextFactory,
                apiVersion: 1,
                basePath: injector.apiBasePath,
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

    private createRequestContextFactory(injector: DependencyInjector): HttpRequestContextFactory<RequestContext> {
        return async () => {
            if (this.state.get() !== ServiceState.RUNNING) {
                logger.debug('Ignoring request while service is not running');
                throw new ServiceNotAvailableError('Service currently not available, sorry!');
            }

            return {
                fileRepository: this.fileRepository!,
                maximumFileSizeInBytes: injector.maximumFileSizeInBytes,
                chunksAssembler: this.chunkedFilesAssembler!
            }
        };
    }
}
