export interface RootState {
    uploadingFiles: Array<UploadingFile>
}

export type UploadingFileId = string;

export interface UploadingFile {
    id: UploadingFileId,
    name: string,
    size: number,
    progress: number,
    error: string
}