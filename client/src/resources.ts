import {UploadElementBinder} from "./services/upload-element-binder/upload-element-binder";
import {UploadResumableElementBinder} from "./services/upload-element-binder/upload-resumable-element-binder";
import {ResumableJsUploadController} from "./services/resumable-js-upload-controller";
import {UploadController} from "./services/upload-controller";
import {initStore} from "./store/store";

export const uploadElementBinder: UploadElementBinder = new UploadResumableElementBinder();

export const apiBasePath = '/api/v1';
export const apiRoutes = {
    upload: `${apiBasePath}/files`,
    download: (fileName: string) => `${apiBasePath}/files/${encodeURI(fileName)}`
};

export let uploadController: any;

export function initProductionDependencies() {
    const oneMiBInBytes = 1024 * 1024;
    uploadController = new ResumableJsUploadController({
        endpoint: apiRoutes.upload,
        chunkSizeInBytes: oneMiBInBytes,
        simultaneousChunkAmount: 4,
        chunkRetryIntervalInMs: 3000,
        maxChunkRetries: 30,
    });
    initStore(uploadController);

    uploadElementBinder.onFileAdded((file) => uploadController.uploadFile(file));
}

export function initTestingDependencies(_uploadController: UploadController<any>) {
    uploadController = _uploadController;

    initStore(uploadController);
    uploadElementBinder.onFileAdded((file) => uploadController.uploadFile(file));
}