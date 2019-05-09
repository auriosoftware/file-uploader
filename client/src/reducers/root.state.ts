export interface RootState {
    uploadingFiles: Array<UploadingFile>
}

export interface UploadingFile {
    id: string,
    name: string,
    size: number,
    progress: number,
    error: string
}