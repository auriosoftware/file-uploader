import { Dictionary } from "../utils/types";
import { FileRepository } from "../file-repository/file-repository";
import { Readable } from "stream";
import { ChunkedFile, ChunkMetadata } from "./chunked-file";

export class ChunkedFilesAssembler {

    private incompleteFiles: Dictionary<ChunkedFile> = {};

    constructor(private fileRepository: FileRepository) {

    }

    public async writeChunk(chunkData: ChunkMetadata, stream: Readable) {

        let matchingFile = this.incompleteFiles[chunkData.fileId];

        if (!matchingFile) {
            matchingFile = new ChunkedFile(chunkData, this.fileRepository);
            matchingFile.onCompleted(() => delete this.incompleteFiles[chunkData.fileId])
            this.incompleteFiles[chunkData.fileId] = matchingFile;
        }

        await matchingFile.writeChunk(chunkData, stream);
    }
}
