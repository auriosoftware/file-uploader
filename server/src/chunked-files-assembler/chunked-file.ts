import { FileRepository } from '../file-repository/file-repository';
import { getLogger } from '../lib/logger';
import { Dictionary } from '../utils/types';
import { signal } from '../lib/signal';
import { pipe } from '../utils/stream-utils';
import { crc32 } from 'crc';
import { InternalError } from '../lib/errors';

const logger = getLogger('ResumablejsChunksAssembler');

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

    constructor(chunkData: ChunkMetadata, private chunksRepository: FileRepository, private fileRepository: FileRepository) {
        this.fileName = chunkData.fileName;
        this.fileId = chunkData.fileId;
        this.chunkSize = chunkData.chunkSize;
        this.totalChunks = chunkData.totalChunks;
    }

    public async writeChunk(chunkData: ChunkMetadata, stream: NodeJS.ReadableStream) {
        this.validateChunkData(chunkData);
        const writer = await this.chunksRepository.getFileWriter(`.resumable-chunk.${this.fileId}.${chunkData.chunkNumber}`);
        let crc: number = 0;
        stream.on('data', (chunk) => crc += crc32(chunk));

        await pipe(stream, writer);
        await this.handleChunkFinished(chunkData, crc);
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
            chunkReader.on('data', (chunk) => crc += crc32(chunk));

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

        for (let i = 1; i <= this.totalChunks; ++i) {
            this.debugLog(`Deleting chunk #${i}`);
            await this.chunksRepository.removeFile(this.getChunkFileName(i));
        }
    }

    private validateChunkData(chunkData: ChunkMetadata) {
        if (chunkData.fileId !== chunkData.fileId) throw new Error(`invalid fileId in chunk data, expected "${this.fileId}", was "${chunkData.fileId}"`);
        // TODO
    }

    private debugLog(message: string) {
        logger.debug(`[${this.fileName}] ${message}`);
    }
}
