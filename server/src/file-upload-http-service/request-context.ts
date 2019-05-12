import { FileRepository } from '../file-repository/file-repository';
import { ChunkedFilesAssembler } from "../chunked-files-assembler/chunked-files-assembler";

export interface RequestContext {
    fileRepository: FileRepository;
    chunksAssembler: ChunkedFilesAssembler;
    maximumFileSizeInBytes?: number;
    maximumChunkSizeInBytes?: number;
}
