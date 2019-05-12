import { Readable } from "stream";
import { FileRepository } from "../file-repository/file-repository";
import { getLogger } from "../lib/logger";
import { Dictionary } from "../utils/types";
import { signal } from "../lib/signal";
import { pipe } from "../utils/stream-utils";

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
    private finishedChunks: Dictionary<boolean> = {};
    private readonly fileName: string;
    private readonly fileId: string;
    private readonly chunkSize: number;
    private readonly totalChunks: number;

    constructor(chunkData: ChunkMetadata, private fileRepository: FileRepository) {
        this.fileName = chunkData.fileName;
        this.fileId = chunkData.fileId;
        this.chunkSize = chunkData.chunkSize;
        this.totalChunks = chunkData.totalChunks;
    }

    public async writeChunk(chunkData: ChunkMetadata, stream: Readable) {
        this.validateChunkData(chunkData);
        const writer = await this.fileRepository.getFileWriter(`.resumable-chunk.${this.fileId}.${chunkData.chunkNumber}`);

        await pipe(stream, writer);
        await this.handleChunkFinished(chunkData);
    }

    private async handleChunkFinished(chunkData: ChunkMetadata): Promise<void> {
        this.finishedChunks[chunkData.chunkNumber] = true;
        const chunksDone = Object.keys(this.finishedChunks).length;
        this.debugLog(`${chunksDone} / ${this.totalChunks} chunks completed`);
        if (chunksDone === this.totalChunks) {
            await this.assembleFile();
        }
    }

    private async assembleFile() {

        this.debugLog(`Final chunk received, starting file assembly`);
        const writer = await this.fileRepository.getFileWriter(this.fileName);

        for (let i = 1; i <= this.totalChunks; ++i) {
            this.debugLog(`Writing chunk #${i}.`);

            const chunkReader = await this.fileRepository.getFileReader(`.resumable-chunk.${this.fileId}.${i}`);
            const promise = new Promise((resolve, reject) => {
                chunkReader.on('end', resolve);
                chunkReader.on('error', reject);
            });
            chunkReader.pipe(writer, { end: false });
            await promise;
        }

        await this.deleteAllChunks();
        this.onCompleted.fire();

        this.debugLog(`successfully assembled`);

        writer.end();
    }

    private async deleteAllChunks() {
        this.debugLog(`Deleting all chunks`);

        for (let i = 1; i <= this.totalChunks; ++i) {
            this.debugLog(`Deleting chunk #${i}`);
            await this.fileRepository.removeFile(`.resumable-chunk.${this.fileId}.${i}`);
        }
    }

    private validateChunkData(chunkData: ChunkMetadata) {
        if (chunkData.fileId !== chunkData.fileId) throw new Error(`invalid fileId in chunk data, expected "${this.fileId}", was "${chunkData.fileId}"`);
        //TODO
    }

    private debugLog(message: string) {
        logger.debug(`[${this.fileName}] ${message}`);
    }
}
