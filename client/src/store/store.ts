import {applyMiddleware, compose, createStore} from "redux";
import {fileUploadMiddleware} from "./files/files.middlewares";
import {uploadController} from "../resources";
import {rootReducer} from "./root.reducer";
import {mapUploadControllerActionsToDispatch} from "../services/redux-upload-action-dispatcher";

declare global {
    interface Window {
        __REDUX_DEVTOOLS_EXTENSION__: any;
        __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any
    }
}

const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const middleware = composeEnhancer(applyMiddleware(fileUploadMiddleware(uploadController)));

export const store = createStore(
    rootReducer,
    middleware
);

mapUploadControllerActionsToDispatch(uploadController, store.dispatch);
