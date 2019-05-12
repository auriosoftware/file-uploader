import {applyMiddleware, compose, createStore} from "redux";
import {fileUploadMiddleware} from "./files/files.middlewares";
import {rootReducer} from "./root.reducer";
import {mapUploadControllerActionsToDispatch} from "../services/redux-upload-action-dispatcher";
import {UploadController} from "../services/upload-controller";

declare global {
    interface Window {
        __REDUX_DEVTOOLS_EXTENSION__: any;
        __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any
    }
}

export let store: any;

export function initStore(uploadController: UploadController<any>) {
    const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
    const middleware = composeEnhancer(applyMiddleware(fileUploadMiddleware(uploadController)));

    store = createStore(rootReducer, middleware);

    mapUploadControllerActionsToDispatch(uploadController, store.dispatch);
}

