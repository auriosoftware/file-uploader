import {UploadElementBinder} from "./services/upload-element-binder/upload-element-binder";
import {UploadResumableElementBinder} from "./services/upload-element-binder/upload-resumable-element-binder";
import {ResumableJsUploadController} from "./services/resumable-js-upload-controller";

export const uploadElementBinder: UploadElementBinder = new UploadResumableElementBinder();

export const apiBasePath = '/api/v1';
export const apiRoutes = {
    upload: `${apiBasePath}/files`,
    download: (fileName: string) => `${apiBasePath}/files/${encodeURI(fileName)}`
};


const oneMiBInBytes = 1024 * 1024;
export const uploadController = new ResumableJsUploadController({
    endpoint: apiRoutes.upload,
    chunkSizeInBytes: oneMiBInBytes,
    simultaneousChunkAmount: 4,
    chunkRetryIntervalInMs: 3000,
    maxChunkRetries: 30,
});

uploadElementBinder.onFileAdded((file) => uploadController.uploadFile(file));

