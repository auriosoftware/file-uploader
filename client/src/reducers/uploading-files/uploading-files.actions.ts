import actionCreatorFactory from 'typescript-fsa';
import Resumable from 'resumablejs';
import {UploadingFile, UploadingFileId} from "../root.state";

const createAction = actionCreatorFactory('UploadingFiles');

export const UploadingFilesActions = {
    uploadFile: createAction<UploadFilePayload>('ADD_FILE'),
    deleteFile: createAction<UploadingFileId>('DELETE_FILE'),
    updateFileProgress: createAction<UpdateFileProgressPayload>('UPDATE_FILE_PROGRESS')
};

export interface UpdateFileProgressPayload {
    fileId: UploadingFileId,
    progress: number
}

export type UploadFilePayload = Pick<UploadingFile, 'id' | 'name' | 'size'>;
