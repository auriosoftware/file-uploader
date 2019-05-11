import { FileRepository } from '../file-repository/file-repository';
import { ResumablejsChunksAssembler } from "../resumablejs-chunks-assembler/resumablejs-chunks-assembler";

export interface RequestContext {
    fileRepository: FileRepository;
    chunksAssembler: ResumablejsChunksAssembler;
    maximumFileSizeInBytes?: number;
}
