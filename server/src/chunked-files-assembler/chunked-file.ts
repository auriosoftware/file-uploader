import { FileRepository } from '../file-repository/file-repository';
import { getLogger } from '../lib/logger';
import { Dictionary } from '../utils/types';
import { signal } from '../lib/signal';
import { pipe } from '../utils/stream-utils';
import { crc32 } from 'crc';
import { getErrorDetails, InternalError, UserError } from '../lib/errors';
import { Countdown } from '../utils/countdown';
import { isDefined } from '../utils/parse-utils';

const logger = getLogger('ResumablejsChunksAssembler');

const DEFAULT_EXPIRATION_IN_SECONDS = 600;

export interface ChunkMetadata {
    chunkNumber: number;
    totalChunks: number;
    chunkSize: number;
    totalSize: number;
    fileId: string;
    fileName: string;
}

export class ChunkedFile {
    public onCompleted = signal<void>();
    public onFailed = signal<void>();
    private finishedChunkChecksums: Dictionary<number> = {};

    private readonly fileName: string;
    private readonly fileId: string;
    private readonly chunkSize: number;
    private readonly totalChunks: number;
    private readonly totalSize: number;

    private expirationCountdown: Countdown;

    constructor(chunkData: ChunkMetadata,
                private chunksRepository: FileRepository,
                private fileRepository: FileRepository,
                private staleTimeoutInSeconds: number = DEFAULT_EXPIRATION_IN_SECONDS) {
        this.fileName = chunkData.fileName;
        this.fileId = chunkData.fileId;
        this.chunkSize = chunkData.chunkSize;
        this.totalChunks = chunkData.totalChunks;
        this.totalSize = chunkData.totalSize;

        this.expirationCountdown = new Countdown(staleTimeoutInSeconds * 1000);
        this.expirationCountdown.onExpired(() => this.handleFileExpired());
    }

    public async writeChunk(chunkData: ChunkMetadata, stream: NodeJS.ReadableStream) {
        this.expirationCountdown.renew();
        this.validateChunkData(chunkData);

        if (this.chunkAlreadyUploaded(chunkData)) {
            logger.debug(`ignoring request to store chunk #${chunkData.chunkNumber} since it was already uploaded earlier.`);
            this.onCompleted.fire();
            return;
        }

        const writer = await this.chunksRepository.getFileWriter(`.resumable-chunk.${this.fileId}.${chunkData.chunkNumber}`);
        let crc: number = 0;
        writer.on('data', (chunk) => crc += crc32(chunk));

        await pipe(stream, writer);
        await this.handleChunkFinished(chunkData, crc);
    }

    public chunkAlreadyUploaded(chunkData: ChunkMetadata) {
        return isDefined(this.finishedChunkChecksums[chunkData.chunkNumber]);
    }

    public handleFileExpired() {
        logger.warn(`No chunk written for file ${this.fileName} in ${Math.round(this.staleTimeoutInSeconds)} s,` +
            ` considering the upload failed.`);
        this.onFailed.fire();
        this.deleteAllChunks().catch((e) => {
            logger.warn(`Error while deleting stale chunks for "${this.fileName}": ${getErrorDetails(e)}`);
        });
    }

    private async handleChunkFinished(chunkData: ChunkMetadata, checksum: number): Promise<void> {
        this.finishedChunkChecksums[chunkData.chunkNumber] = checksum;
        const chunksDone = Object.keys(this.finishedChunkChecksums).length;
        this.debugLog(`${chunksDone} / ${this.totalChunks} chunks completed`);
        if (chunksDone === this.totalChunks) {
            await this.assembleFile();
        }
    }

    private async assembleFile() {

        this.debugLog(`Final chunk received, starting file assembly`);
        const writer = await this.fileRepository.getFileWriter(this.fileName);

        for (let i = 1; i <= this.totalChunks; ++i) {
            let crc: number = 0;
            this.debugLog(`Writing chunk #${i}`);
            const chunkReader = await this.chunksRepository.getFileReader(this.getChunkFileName(i));
            writer.on('data', (data) => {
                crc += crc32(data);
            });

            await pipe(chunkReader, writer, { end: false });

            this.assertChunkCRCCorrect(i, crc);
        }
        writer.end();

        await this.deleteAllChunks();
        this.onCompleted.fire();

        this.debugLog(`successfully assembled`);
    }

    private assertChunkCRCCorrect(chunkNumber: number, crc: number) {
        if (crc !== this.finishedChunkChecksums[chunkNumber]) {
            logger.warn(`Upload of ${this.fileName} failed due to corrupted chunk ` +
                `${this.getChunkFileName(chunkNumber)} (expected crc ${this.finishedChunkChecksums[chunkNumber]}, got ${crc})`);
            throw new InternalError(`Chunk #${chunkNumber} corrupted`);
        }

    }

    private getChunkFileName(chunkNumber: number) {
        return `.resumable-chunk.${this.fileId}.${chunkNumber}`;
    }

    private async deleteAllChunks() {
        this.debugLog(`Deleting all chunks`);

        for (const chunkNumber of Object.keys(this.finishedChunkChecksums).map(p => parseInt(p, 10))) {
            this.debugLog(`Deleting chunk #${chunkNumber}`);
            const chunkFileName = this.getChunkFileName(chunkNumber);
            if (await this.chunksRepository.hasFile(chunkFileName)) {
                await this.chunksRepository.removeFile(chunkFileName);
            }
        }
    }

    private validateChunkData(chunkData: ChunkMetadata) {
        if (chunkData.fileName === '') throw new UserError('fileName cannot be empty');
        if (chunkData.fileId === '') throw new UserError('fileId cannot be empty');

        assertEqual(chunkData.fileId, this.fileId, 'fileId');
        assertEqual(chunkData.fileName, this.fileName, 'fileName');
        assertEqual(chunkData.totalChunks, this.totalChunks, 'totalChunks value');
        assertEqual(chunkData.totalSize, this.totalSize, 'totalSize value');

        if (chunkData.chunkNumber > chunkData.totalChunks && chunkData.chunkNumber < 1) {
            throw new UserError(`chunk number "${chunkData.chunkNumber}" is invalid"`);
        }
    }

    private debugLog(message: string) {
        logger.debug(`[${this.fileName}] ${message}`);
    }
}

function assertEqual<T>(actual: T, expected: T, propertyName: string) {
    if (actual !== expected) {
        throw new UserError(`invalid ${propertyName} in chunk data, expected "${expected}", was "${actual}`);
    }
}
