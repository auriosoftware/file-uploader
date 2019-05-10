import actionCreatorFactory from 'typescript-fsa';
import Resumable from 'resumablejs';
import {UploadingFileId} from "../root.state";

const createAction = actionCreatorFactory('UploadingFiles');

export const UploadingFilesActions = {
    uploadFile: createAction<Resumable.ResumableFile>('ADD_FILE'),
    deleteFile: createAction<UploadingFileId>('DELETE_FILE')
};
