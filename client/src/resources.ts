import {UploadElementBinder} from "./services/upload-element-binder/upload-element-binder";
import {UploadResumableElementBinder} from "./services/upload-element-binder/upload-resumable-element-binder";
import {ResumableJsUploadController} from "./services/resumable-js-upload-controller";

export const uploadElementBinder: UploadElementBinder = new UploadResumableElementBinder();

const oneMiBInBytes = 1024 * 1024;
export const uploadController = new ResumableJsUploadController({
    endpoint: '/v1/files',
    chunkSizeInBytes: oneMiBInBytes,
    simultaneousChunkAmount: 4
});


uploadElementBinder.onFileAdded((file) => uploadController.uploadFile(file));
