import { Dictionary } from '../../utils/types';

export interface FilesState {
    byId: Dictionary<File>;
}

export type FileId = string;

export interface File {
    id: FileId;
    startedAt: Date;
    status: 'done' | 'uploading' | 'failed' | 'aborted';
    name: string;
    size: number;
    progress: number;
    error: string;
}
