export type FilesState = Array<File>;

export type FileId = string;

export interface File {
    id: FileId;
    status: 'done' | 'uploading' | 'failed';
    name: string;
    size: number;
    progress: number;
    error: string;
}
