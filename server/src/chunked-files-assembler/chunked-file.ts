import { Readable } from "stream";
import { FileRepository } from "../file-repository/file-repository";
import { getLogger } from "../utils/logger";
import { Dictionary } from "../utils/types";
import { signal } from "../utils/signal";

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

    public onCompleted = signal<void>();

    public async writeChunk(chunkData: ChunkMetadata, stream: Readable) {
        this.validateChunkData(chunkData);

        const writer = await this.fileRepository.getFileWriter(`.resumable-chunk.${this.fileId}.${chunkData.chunkNumber}`);
        stream.pipe(writer);

        stream.on("end", async () => {
            this.finishedChunks[chunkData.chunkNumber] = true;
            console.log("CHUNK", chunkData.chunkNumber, "DONE",JSON.stringify(this.finishedChunks));
            console.log("ASSEMBLED", Object.keys(this.finishedChunks).length, "/", this.totalChunks , "CHUNKS")
            if (Object.keys(this.finishedChunks).length === this.totalChunks) {
                await this.assembleFile();
            }
            //TODO ERROR HANDLING
        });
    }

    private async assembleFile() {

        logger.debug(`Last chunk received, assembling ${this.fileName}.`);
        const writer = await this.fileRepository.getFileWriter(this.fileName);

        for (let i = 1; i <= this.totalChunks; ++i) {
            logger.debug(`Writing chunk #${i}.`);

            const chunkReader = await this.fileRepository.getFileReader(`.resumable-chunk.${this.fileId}.${i}`);
            chunkReader.pipe(writer, { end: false });
            await new Promise((resolve, reject) => {
                chunkReader.on('end', resolve);
                chunkReader.on('error', reject);
            });
        }

        await this.deleteAllChunks();
        this.onCompleted.fire();

        logger.debug(`"${this.fileName}" successfully assembled.`);

        writer.end();
    }

    private async deleteAllChunks() {
        logger.debug(`Deleting chunks for ${this.fileId}`);

        for (let i = 1; i <= this.totalChunks; ++i) {
            logger.debug(`Deleting chunk #${i}.`);
            await this.fileRepository.removeFile(`.resumable-chunk.${this.fileId}.${i}`);
        }
    }

    private validateChunkData(chunkData: ChunkMetadata) {
        if (chunkData.fileId !== chunkData.fileId) throw new Error(`invalid fileId in chunk data, expected "${this.fileId}", was "${chunkData.fileId}"`);
        //TODO
    }
}
