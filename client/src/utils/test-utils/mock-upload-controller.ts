import { UploadController } from '../../services/upload-controller';
import { RawFile } from './raw-file';
import { signal } from '../signal';

export class MockUploadController implements UploadController<RawFile> {
    public onFileAdded = signal<RawFile>();
    public onFileProgress = signal<RawFile>();
    public onFileUploadFailed = signal<{file: RawFile, message: string}>();
    public onFileUploaded = signal<RawFile>();
    public abortUpload() {}
    public uploadFile() {}
}
