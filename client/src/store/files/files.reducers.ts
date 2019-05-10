import {reducerWithInitialState} from "typescript-fsa-reducers";
import {FilesActions} from "./files.actions";
import {File} from "./files.state";
import * as _ from 'lodash';
import {Success} from "typescript-fsa";

export const filesReducer = reducerWithInitialState<Array<File>>([])
    .case(FilesActions.uploadFile.started, (state, file) => {
        return [...state, {id: file.id, name: file.name, progress: 0, size: file.size, error: '', status: 'uploading'}];
    })
    .case(FilesActions.uploadFile.failed, (state, action) => {
        const files = _.cloneDeep(state) as Array<File>;
        const file = files.find((file) => file.id === action.params.id);

        if (file) {
            file.error = action.error.message;
            file.status = 'failed';
        }

        return files;
    })
    .case(FilesActions.updateFileProgress, (state, {fileId, progress}) => {
        const files = _.cloneDeep(state) as Array<File>;
        const file = files.find((file) => file.id === fileId);

        if (file) {
            file.progress = progress
        }

        return files;
    })
    .case(FilesActions.deleteFile, (state, fileId) => {
        const files = _.cloneDeep(state);
        const index = files.findIndex((file) => file.id === fileId);

        if (index !== -1) {
            files.splice(index, 1);
        }

        return files;
    })
    .case(FilesActions.uploadFile.done, (state, action: Success<File, void>) => {
        const files = _.cloneDeep(state) as Array<File>;
        const file = files.find((file) => file.id === action.params.id);

        if (file) {
            file.status = 'done';
        }

        return files;
    })
;
