import {reducerWithInitialState} from "typescript-fsa-reducers";
import {UploadingFilesActions} from "./uploading-files.actions";
import {RootState, UploadingFile} from "../root.state";
import Resumable from 'resumablejs';
import * as _ from 'lodash';

export const uploadingFilesReducer = reducerWithInitialState<Array<UploadingFile>>([])
    .case(UploadingFilesActions.uploadFile, (state, file: Resumable.ResumableFile) => {
        return [...state, {id: file.uniqueIdentifier, name: file.fileName, progress: 0, size: file.size, error: ''}];
    })
    .case(UploadingFilesActions.deleteFile, (state, fileId) => {
        const files = _.cloneDeep(state);
        const index = files.findIndex((file) => file.id === fileId);

        if(index !== -1) {
            files.splice(index, 1);
        }

        return files;
    })
;
