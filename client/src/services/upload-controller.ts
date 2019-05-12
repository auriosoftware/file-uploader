import { SignalHandler } from '../utils/signal';

export interface UploadController<T> {
    onFileAdded(handler: SignalHandler<T>): void;
    onFileUploaded(handler: SignalHandler<T>): void;
    onFileUploadFailed(handler: SignalHandler<{file: T, message: string}>): void;
    onFileProgress(handler: SignalHandler<T>): void;
    abortUpload(fileId: string): void;
    uploadFile(file: File): void;
}
