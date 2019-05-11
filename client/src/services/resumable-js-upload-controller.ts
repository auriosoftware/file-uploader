import {UploadController} from "./upload-controller";
import Resumable from 'resumablejs';
import {signal} from "../utils/signal";
import { Dictionary } from "../utils/types";

export interface Config {
    chunkSizeInBytes: number;
    endpoint: string;
    simultaneousChunkAmount: number;
    chunkRetryIntervalInMs: number,
    maxChunkRetries: number,
}


export class ResumableJsUploadController implements UploadController<Resumable.ResumableFile> {

    private activeUploads: Dictionary<Resumable.ResumableFile> = {};

    constructor(private config: Config) {
    }

    onFileAdded = signal<Resumable.ResumableFile>();
    onFileProgress = signal<Resumable.ResumableFile>();
    onFileUploadFailed = signal<Resumable.ResumableFile>();
    onFileUploaded = signal<Resumable.ResumableFile>();

    public abortUpload(fileId: string): void {
        const existingFile = this.activeUploads[fileId];

        if(existingFile) {
            existingFile.abort();
        }
    }

    public uploadFile(file: File): void {
        const resumable = new Resumable({
            target: this.config.endpoint,
            simultaneousUploads: this.config.simultaneousChunkAmount,
            chunkSize: this.config.chunkSizeInBytes,
            testChunks:false,
            chunkRetryInterval: this.config.chunkRetryIntervalInMs,
            maxChunkRetries: this.config.maxChunkRetries,
        });

        const removeFromActiveUploads = (file: Resumable.ResumableFile) => {
            delete this.activeUploads[file.uniqueIdentifier];
            resumable.removeFile(file);
        };

        resumable.on('error', (error) => {
            console.error(`resumablejs error while uploading "${file.name}"`, error);
        });

        resumable.addFile(file);

        resumable.on('fileAdded', (file: Resumable.ResumableFile) => {
            this.onFileAdded.fire(file);
            resumable.upload();
        });
        resumable.on('fileError', (file: Resumable.ResumableFile) => {
            removeFromActiveUploads(file);
            this.onFileUploadFailed.fire(file);
        });
        resumable.on('fileSuccess', (file: Resumable.ResumableFile) => {
            removeFromActiveUploads(file);
            this.onFileUploaded.fire(file);
        });
        resumable.on('fileProgress', this.onFileProgress.fire);


    }


}

