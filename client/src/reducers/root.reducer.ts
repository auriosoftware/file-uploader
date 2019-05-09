import {combineReducers} from "redux";
import {RootState} from "./root.state";
import {uploadingFilesReducer} from "./uploading-files/uploading-files.reducers";

export const rootReducer = combineReducers<RootState>({
    uploadingFiles: uploadingFilesReducer
});

