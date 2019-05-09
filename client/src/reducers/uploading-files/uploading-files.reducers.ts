import {reducerWithInitialState} from "typescript-fsa-reducers";
import {UploadingFilesActions} from "./uploading-files.actions";
import {RootState, UploadingFile} from "../root.state";
import Resumable from 'resumablejs';

export const uploadingFilesReducer = reducerWithInitialState<Array<UploadingFile>>([])
    .case(UploadingFilesActions.uploadFile, (state, file: Resumable.ResumableFile) => {
        console.log(file);
        return [...state, {id: file.uniqueIdentifier, name: file.fileName, progress: 0, size: file.size, error: ''}];
    });
