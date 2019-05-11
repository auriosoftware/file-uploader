import { Readable } from "stream";
import { FileRepository } from "../file-repository/file-repository";
import { getLogger } from "../utils/logger";

const logger = getLogger('ResumablejsChunksAssembler');

export interface ChunkMetadata {
    chunkNumber: number;
    totalChunks: number;
    chunkSize: number;
    totalSize: number;
    fileId: string;
    filename: string;
    relativePath: string;

}

export class ResumablejsChunksAssembler {
    constructor(private fileRepository: FileRepository) {

    }

    public async writeChunk(chunkData: ChunkMetadata, stream: Readable) {
        const writer = await this.fileRepository.getFileWriter(`.resumable-chunk.${chunkData.fileId}.${chunkData.chunkNumber}`);
        stream.pipe(writer);

        if (chunkData.chunkNumber === chunkData.totalChunks) {
            stream.on("end", () => this.assembleFile(chunkData));
        }
    }

    private async assembleFile(chunkData: ChunkMetadata) {

        logger.debug(`Last chunk received, assembling ${chunkData.filename}.`);
        const writer = await this.fileRepository.getFileWriter(chunkData.filename);

        for (let i = 1; i <= chunkData.totalChunks; ++i) {
            logger.debug(`Writing chunk #${i}.`);
            const chunkReader = await this.fileRepository.getFileReader(`.resumable-chunk.${chunkData.fileId}.${i}`);
            chunkReader.pipe(writer, { end: false });
            await new Promise((resolve, reject) => {
                chunkReader.on('end', resolve);
                chunkReader.on('error', reject);
            });
        }

        await this.removeChunks(chunkData);

        logger.debug(`"${chunkData.filename}" successfully assembled.`);

        writer.end();
    }

    private async removeChunks(chunkData: ChunkMetadata) {
        logger.debug(`deleting chunks for ${chunkData.fileId}`);

        for (let i = 1; i <= chunkData.totalChunks; ++i) {
            logger.debug(`Deleting chunk #${i}.`);
            await this.fileRepository.removeFile(`.resumable-chunk.${chunkData.fileId}.${i}`);
        }
    }
}
