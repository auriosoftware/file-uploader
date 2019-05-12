import { combineReducers } from 'redux';
import { RootState } from './root.state';
import { filesReducer } from './files/files.reducer';

export const rootReducer = combineReducers<RootState>({
    files: filesReducer
});
