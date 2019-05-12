import actionCreatorFactory from 'typescript-fsa';
import { FileId } from './files.state';

const createAction = actionCreatorFactory('UploadingFiles');

export const FilesActions = {
    uploadFile: createAction.async<UploadFilePayload, void, Error>('ADD_FILE'),
    abortFile: createAction<FileId>('DELETE_FILE'),
    updateFileProgress: createAction<UpdateFileProgressPayload>('UPDATE_FILE_PROGRESS'),
    markFileUploadFailed: createAction<FileId>('MARK_FILE_UPLOAD_FAILED')
};

export interface UpdateFileProgressPayload {
    fileId: FileId;
    progress: number;
}

export interface UploadFilePayload {
    id: FileId;
    name: string;
    size: number;
}
