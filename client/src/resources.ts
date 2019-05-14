import { ResumableJsUploadController } from './services/upload-controller/resumable-js-upload-controller';
import { UploadController } from './services/upload-controller/upload-controller';
import { initStore } from './store/store';
import { config } from './config/config';
import { ResumablejsFileUploadDomListener } from './services/file-upload-dom-listener/resumablejs-file-upload-dom-listener';
import { FileUploadDOMListener } from './services/file-upload-dom-listener/file-upload-dom-listener';

export const fileUploadDOMListener: FileUploadDOMListener = new ResumablejsFileUploadDomListener();

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
        maxChunkRetries: config.upload.maxChunkRetries
    });
    initStore(uploadController);

    fileUploadDOMListener.onFileAdded((file) => uploadController.uploadFile(file));
}

export function initTestingDependencies(uploadController: UploadController) {
    initStore(uploadController);
    fileUploadDOMListener.onFileAdded((file) => uploadController.uploadFile(file));
}
