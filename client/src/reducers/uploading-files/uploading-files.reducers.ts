import {reducerWithInitialState} from "typescript-fsa-reducers";
import {UploadingFilesActions} from "./uploading-files.actions";
import {UploadingFile} from "../root.state";
import * as _ from 'lodash';

export const uploadingFilesReducer = reducerWithInitialState<Array<UploadingFile>>([])
    .case(UploadingFilesActions.uploadFile, (state, file) => {
        return [...state, {id: file.id, name: file.name, progress: 0, size: file.size, error: ''}];
    })
    .case(UploadingFilesActions.updateFileProgress, (state, {fileId, progress}) => {
        const files = _.cloneDeep(state) as Array<UploadingFile>;
        const file = files.find((file) => file.id === fileId);

        if(file) {
            file.progress = progress
        }

        return files;
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
