import { FileDescriptor, UploadController } from '../../services/upload-controller/upload-controller';
import { signal } from '../signal';

export class MockUploadController implements UploadController {
    public onFileAdded = signal<FileDescriptor>();
    public onFileProgress = signal<{file: FileDescriptor, progress: number}>();
    public onFileUploadFailed = signal<{file: FileDescriptor, message: string}>();
    public onFileUploaded = signal<FileDescriptor>();
    public abortUpload() {}
    public uploadFile() {}
}
