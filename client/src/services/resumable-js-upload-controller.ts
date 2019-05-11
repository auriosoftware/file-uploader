import {UploadController} from "./upload-controller";
import Resumable from 'resumablejs';
import {signal} from "../utils/signal";

export interface Config {
    chunkSizeInBytes: number;
    endpoint: string;
    simultaneousChunkAmount: number;
}


export class ResumableJsUploadController implements UploadController<Resumable.ResumableFile> {

    private resumableList: Array<Resumable> = [];

    constructor(private config: Config) {
        console.log('init resumable')
    }

    onFileAdded = signal<Resumable.ResumableFile>();
    onFileProgress = signal<Resumable.ResumableFile>();
    onFileUploadFailed = signal<Resumable.ResumableFile>();
    onFileUploaded = signal<Resumable.ResumableFile>();

    public abortUpload(fileId: string): void {
        const existingFile = this.findFileInResumableList(fileId);

        if(existingFile) {
            existingFile.abort();
        }
    }

    public uploadFile(file: File): void {
        console.log('uploading a file!');
        const resumable = new Resumable({
            target: this.config.endpoint,
            simultaneousUploads: this.config.simultaneousChunkAmount,
            chunkSize: this.config.chunkSizeInBytes,
            testChunks:false,
        });
        this.resumableList.push(resumable);

        resumable.addFile(file);

        resumable.on('fileAdded', (file) => {
            this.onFileAdded.fire(file);
            resumable.upload();
            console.log('ADDING A FILE!');
        });
        resumable.on('fileError', this.onFileUploadFailed.fire);
        resumable.on('fileSuccess', this.onFileUploaded.fire);
        resumable.on('fileProgress', this.onFileProgress.fire);
    }

    private findFileInResumableList(fileId: string): Resumable.ResumableFile | undefined {
        let foundedFile: Resumable.ResumableFile | undefined;

        this.resumableList.forEach((resumable) => {
            foundedFile = resumable.files.find((file) => file.uniqueIdentifier === fileId);

            if(foundedFile) {
                return;
            }
        });

        return foundedFile;
    }

}

