import { FileDescriptor, UploadController } from './upload-controller';
import Resumable from 'resumablejs';
import { signal } from '../../utils/signal';
import { Dictionary } from '../../utils/types';

export interface Config {
    chunkSizeInBytes: number;
    endpoint: string;
    simultaneousChunkAmount: number;
    chunkRetryIntervalInMs: number;
    maxChunkRetries: number;
}

export class ResumableJsUploadController implements UploadController {

    public onFileAdded = signal<FileDescriptor>();
    public onFileProgress = signal<{ file: FileDescriptor, progress: number }>();
    public onFileUploadFailed = signal<{ file: FileDescriptor, message: string }>();
    public onFileUploaded = signal<FileDescriptor>();
    private activeUploads: Dictionary<Resumable.ResumableFile> = {};

    constructor(private config: Config) {
    }

    public abortUpload(fileId: string): void {
        const existingFile = this.activeUploads[fileId];

        if (existingFile) {
            existingFile.abort();
        }
    }

    public uploadFile(fileToUpload: File): void {
        const resumable = new Resumable({
            target: this.config.endpoint,
            simultaneousUploads: this.config.simultaneousChunkAmount,
            chunkSize: this.config.chunkSizeInBytes,
            testChunks: false,
            chunkRetryInterval: this.config.chunkRetryIntervalInMs,
            maxChunkRetries: this.config.maxChunkRetries
        });

        const removeFromActiveUploads = (file: Resumable.ResumableFile) => {
            delete this.activeUploads[file.uniqueIdentifier];
            resumable.removeFile(file);
        };

        resumable.on('error', (error) => {
            console.error(`resumablejs error while uploading "${fileToUpload.name}"`, error);
        });

        resumable.addFile(fileToUpload);

        resumable.on('fileAdded', (file: Resumable.ResumableFile) => {
            this.onFileAdded.fire(toFileDescriptor(file));
            this.activeUploads[file.uniqueIdentifier] = file;
            resumable.upload();
        });
        resumable.on('fileError', (file: Resumable.ResumableFile, message) => {
            removeFromActiveUploads(file);
            this.onFileUploadFailed.fire({ file: toFileDescriptor(file), message });
        });
        resumable.on('fileSuccess', (file: Resumable.ResumableFile) => {
            removeFromActiveUploads(file);
            this.onFileUploaded.fire(toFileDescriptor(file));
        });
        resumable.on('fileProgress', (file: Resumable.ResumableFile) => {
            this.onFileProgress.fire({
                file: toFileDescriptor(file),
                progress: file.progress(true) * 100
            });
        });

    }

}

function toFileDescriptor(file: Resumable.ResumableFile): FileDescriptor {
    return {
        size: file.size,
        name: file.fileName,
        id: file.uniqueIdentifier
    };
}
