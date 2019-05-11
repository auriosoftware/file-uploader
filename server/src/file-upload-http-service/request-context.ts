import { FileRepository } from "../file-repository/file-repository";

export interface RequestContext {
    fileRepository: FileRepository;
}
