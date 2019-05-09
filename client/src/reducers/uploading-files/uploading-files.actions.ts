import actionCreatorFactory from 'typescript-fsa';
import Resumable from 'resumablejs';

const createAction = actionCreatorFactory('UploadingFiles');

export const UploadingFilesActions = {
    uploadFile: createAction<Resumable.ResumableFile>('ADD_FILE'),
};
