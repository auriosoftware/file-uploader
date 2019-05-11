export interface UploadController<T> {
    onFileAdded(cb: (file: T) => void): void;
    onFileUploaded(cb: (file: T) => void): void;
    onFileUploadFailed(cb: (file: T) => void): void;
    onFileProgress(cb: (file: T) => void): void;
    abortUpload(fileId: string): void;
    uploadFile(file: File): void;
}
