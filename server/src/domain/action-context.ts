import { FileRepository } from "./file-repository";

export interface ActionContext {
    fileStore: FileRepository;
}
