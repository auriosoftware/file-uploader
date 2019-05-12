import { UploadController } from './upload-controller';
import { FilesActions } from '../../store/files/files.actions';
import { Dispatch, Store } from 'redux';
import { takeEvery } from 'redux-saga/effects';
import { SagaMiddleware } from 'redux-saga';

export function connectUploadControllerToStore(uploadController: UploadController, store: Store, sagaMiddleware: SagaMiddleware) {
    mapUploadControllerToDispatch(uploadController, store.dispatch);
    mapReduxActionsToUploadController(uploadController, sagaMiddleware);
}

export const mapUploadControllerToDispatch = (controller: UploadController, dispatch: Dispatch) => {

    controller.onFileAdded(file =>
        dispatch(FilesActions.uploadFile.started(file)));

    controller.onFileProgress(({file, progress}) =>
        dispatch(FilesActions.updateFileProgress({progress: progress, fileId: file.id})));

    controller.onFileUploadFailed(data =>
        dispatch(FilesActions.uploadFile.failed({params: data.file, error: new Error(data.message)})));

    controller.onFileUploaded(file =>
        dispatch(FilesActions.uploadFile.done({ params: file, result: undefined})));

};

export function mapReduxActionsToUploadController(uploadController: UploadController, sagaMiddleware: SagaMiddleware) {
    sagaMiddleware.run(listenForAbortFileAction, uploadController);
}

export function* listenForAbortFileAction(uploadController: UploadController) {
    yield takeEvery(FilesActions.abortFile, (action) => uploadController.abortUpload(action.payload));
}
