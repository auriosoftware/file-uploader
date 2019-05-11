import { Dictionary } from "../../utils/types";

export type FilesState = {
    byId: Dictionary<File>
};

export type FileId = string;

export interface File {
    id: FileId;
    startedAt: Date;
    status: 'done' | 'uploading' | 'failed';
    name: string;
    size: number;
    progress: number;
    error: string;
}
