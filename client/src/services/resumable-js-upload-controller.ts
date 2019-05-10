import {UploadController} from "./upload-controller";
import Resumable from 'resumablejs';

export class ResumableJsUploadController implements UploadController<Resumable.ResumableFile> {

    private resumable: Resumable;

    constructor(endpoint: string) {
        this.resumable = new Resumable({target: endpoint});
    }

    onFileAdded(cb: (file: Resumable.ResumableFile) => void): void {
        return this.resumable.on('fileAdded', cb);
    }

    onFileProgress(cb: (file: Resumable.ResumableFile) => void): void {
        return this.resumable.on('fileProgress', cb);
    }

    onFileUploadFailed(cb: (file: Resumable.ResumableFile) => void): void {
        return this.resumable.on('fileError', cb);
    }

    onFileUploaded(cb: (file: Resumable.ResumableFile) => void): void {
        return this.resumable.on('fileSuccess', cb);
    }

    setDropZoneElement(htmlElement: HTMLElement): void {
        this.resumable.assignDrop(htmlElement);
    }

    setFileInputElement(htmlElement: HTMLElement): void {
        const allowFolderUpload = false;
        this.resumable.assignBrowse(htmlElement, allowFolderUpload);
    }

}