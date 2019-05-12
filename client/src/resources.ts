import {UploadElementBinder} from "./services/upload-element-binder/upload-element-binder";
import {UploadResumableElementBinder} from "./services/upload-element-binder/upload-resumable-element-binder";
import {ResumableJsUploadController} from "./services/resumable-js-upload-controller";
import {UploadController} from "./services/upload-controller";
import {initStore} from "./store/store";
import {config} from "./config/config";

export const uploadElementBinder: UploadElementBinder = new UploadResumableElementBinder();

export const apiBasePath = config.baseApiURI;
export const apiRoutes = {
    upload: `${apiBasePath}/files`,
    download: (fileName: string) => `${apiBasePath}/files/${encodeURI(fileName)}`
};

export function initProductionDependencies() {
    const uploadController = new ResumableJsUploadController({
        endpoint: apiRoutes.upload,
        chunkSizeInBytes: config.upload.chunkSizeInBytes,
        simultaneousChunkAmount: config.upload.simultaneousChunkAmount,
        chunkRetryIntervalInMs: config.upload.chunkRetryIntervalInMs,
        maxChunkRetries: config.upload.maxChunkRetries,
    });
    initStore(uploadController);

    uploadElementBinder.onFileAdded((file) => uploadController.uploadFile(file));
}

export function initTestingDependencies(uploadController: UploadController<Resumable.ResumableFile>) {
    initStore(uploadController);
    uploadElementBinder.onFileAdded((file) => uploadController.uploadFile(file));
}