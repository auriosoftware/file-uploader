import { UploadController } from "../../../services/upload-controller";
import { RawFile } from "../../../services/redux-upload-action-dispatcher";
import { signal } from "../../signal";

export class MockUploadController implements UploadController<RawFile> {
    onFileAdded = signal<RawFile>();
    onFileProgress = signal<RawFile>();
    onFileUploadFailed = signal<{file: RawFile, message: string}>();
    onFileUploaded = signal<RawFile>();
    abortUpload() {};
    uploadFile() {};
}
