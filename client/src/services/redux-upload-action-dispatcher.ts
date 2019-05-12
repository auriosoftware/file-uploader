import { UploadController } from './upload-controller';
import Resumable from 'resumablejs';
import { FilesActions } from '../store/files/files.actions';
import { Dispatch } from 'redux';

export const mapUploadControllerActionsToDispatch = (controller: UploadController<Resumable.ResumableFile>, dispatch: Dispatch) => {

    controller.onFileAdded(file =>
        dispatch(FilesActions.uploadFile.started(getUploadFilePayloadFrom(file))));

    controller.onFileProgress(file =>
        dispatch(FilesActions.updateFileProgress({
            progress: file.progress(true) * 100,
            fileId: file.uniqueIdentifier
        })));

    controller.onFileUploadFailed(data =>
        dispatch(FilesActions.uploadFile.failed({
            params: getUploadFilePayloadFrom(data.file),
            error: new Error(data.message)
        })));

    controller.onFileUploaded(file =>
        dispatch(FilesActions.uploadFile.done({
            params: getUploadFilePayloadFrom(file),
            result: undefined
        })));

};

function getUploadFilePayloadFrom(file: Resumable.ResumableFile) {
    return {
        size: file.size,
        name: file.fileName,
        id: file.uniqueIdentifier
    };
}
