import { reducerWithInitialState } from "typescript-fsa-reducers";
import { FilesActions, UpdateFileProgressPayload, UploadFilePayload } from "./files.actions";
import { File, FileId, FilesState } from "./files.state";
import { Failure, Success } from "typescript-fsa";

export const filesReducer = reducerWithInitialState<FilesState>({ byId: {} })
    .case(FilesActions.uploadFile.started, handleUploadFileStarted)
    .case(FilesActions.uploadFile.done, handleUploadFileDone)
    .case(FilesActions.uploadFile.failed, handleUploadFileFailed)
    .case(FilesActions.updateFileProgress, handleProgressUpdate)
    .case(FilesActions.abortFile, handleAbortFile);

function handleUploadFileStarted(state: FilesState, payload: UploadFilePayload): FilesState {
    return {
        byId: {
            ...state.byId,
            [payload.id]: {
                id: payload.id,
                startedAt: new Date(),
                name: payload.name,
                progress: 0,
                size: payload.size,
                error: '',
                status: 'uploading'
            }
        }
    };
}

function handleUploadFileFailed(state: FilesState, action: Failure<UploadFilePayload, Error>): FilesState {
    return updateFile(state, action.params.id,
        (file) => ({
            ...file,
            error: action.error.message,
            status: 'failed',
        })
    );
}

function handleProgressUpdate(state: FilesState, payload: UpdateFileProgressPayload): FilesState {
    if( ! state.byId[payload.fileId]) {
        return state;
    }

    return updateFile(state, payload.fileId, (file) => {
        if (file.status !== 'uploading') return file;
        return {
            ...file,
            progress: payload.progress
        }
    });
}

function handleAbortFile(state: FilesState, fileId: FileId) {
    return updateFile(state, fileId, file => ({
        ...file,
        status: 'aborted'
    }));
}

function handleUploadFileDone(state: FilesState, action: Success<UploadFilePayload, void>) {
    return updateFile(state, action.params.id, file => ({
        ...file,
        status: 'done'
    }));
}

function updateFile(state: FilesState, fileId: FileId, updateFunc: (file: File) => File): FilesState {
    const fileToUpdate = state.byId[fileId];
    return {
        byId: {
            ...state.byId,
            [fileId]: updateFunc(fileToUpdate)
        }
    }
}
