import { Dictionary } from "../utils/types";
import { FileRepository } from "../file-repository/file-repository";
import { ChunkedFile, ChunkMetadata } from "./chunked-file";

export class ChunkedFilesAssembler {

    private incompleteFiles: Dictionary<ChunkedFile> = {};

    constructor(private chunksRepository: FileRepository, private fileRepository: FileRepository) {

    }

    public async writeChunk(chunkData: ChunkMetadata, stream: NodeJS.ReadableStream) {
        let matchingFile = this.incompleteFiles[chunkData.fileId];

        if (!matchingFile) {
            matchingFile = new ChunkedFile(chunkData, this.chunksRepository, this.fileRepository);
            matchingFile.onCompleted(() => delete this.incompleteFiles[chunkData.fileId]);
            matchingFile.onFailed(() => delete this.incompleteFiles[chunkData.fileId]);
            this.incompleteFiles[chunkData.fileId] = matchingFile;
        }

        try {
            await matchingFile.writeChunk(chunkData, stream);
        } catch (error) {
            delete this.incompleteFiles[chunkData.fileId];
            throw error;
        }
    }

}
