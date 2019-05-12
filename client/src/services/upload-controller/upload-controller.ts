import { SignalHandler } from '../../utils/signal';

export interface FileDescriptor {
    id: string;
    size: number;
    name: string;
}

export interface UploadController {
    onFileAdded(handler: SignalHandler<FileDescriptor>): void;
    onFileUploaded(handler: SignalHandler<FileDescriptor>): void;
    onFileUploadFailed(handler: SignalHandler<{file: FileDescriptor, message: string}>): void;
    onFileProgress(handler: SignalHandler<{file: FileDescriptor, progress: number}>): void;
    abortUpload(fileId: string): void;
    uploadFile(file: File): void;
}
