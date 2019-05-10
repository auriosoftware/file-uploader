import {combineReducers} from "redux";
import {RootState} from "./root.state";
import {filesReducer} from "./files/files.reducers";

export const rootReducer = combineReducers<RootState>({
    files: filesReducer
});

