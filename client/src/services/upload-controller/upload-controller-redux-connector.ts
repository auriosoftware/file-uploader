import { UploadController } from './upload-controller';
import { FilesActions } from '../../store/files/files.actions';
import { Dispatch, Middleware, Store } from 'redux';
import { isType } from 'typescript-fsa';

export function connectUploadControllerToStore(controller: UploadController, store: Store) {
    mapUploadControllerToDispatch(controller, store.dispatch);
}

export const mapUploadControllerToDispatch = (controller: UploadController, dispatch: Dispatch) => {

    controller.onFileAdded(file =>
        dispatch(FilesActions.uploadFile.started(file)));

    controller.onFileProgress(({file, progress}) =>
        dispatch(FilesActions.updateFileProgress({
            progress: progress,
            fileId: file.id
        })));

    controller.onFileUploadFailed(data =>
        dispatch(FilesActions.uploadFile.failed({
            params: data.file,
            error: new Error(data.message)
        })));

    controller.onFileUploaded(file =>
        dispatch(FilesActions.uploadFile.done({
            params: file,
            result: undefined
        })));

};

export const mapActionsToUploadController = (uploadController: UploadController): Middleware =>
    store => next => action => {
        if (isType(action, FilesActions.abortFile)) {
            uploadController.abortUpload(action.payload);
        }
        next(action);
    };
