import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import {Provider} from 'react-redux';
import {createStore, applyMiddleware, compose} from "redux";
import {rootReducer} from "./store/root.reducer";
import {mapUploadControllerActionsToDispatch} from "./services/redux-upload-action-dispatcher";
import {fileUploadMiddleware} from "./store/files/files.middlewares";
import {ResumableJsUploadController} from "./services/resumable-js-upload-controller";
import Resumable from 'resumablejs';
import {UploadResumableElementBinder} from "./services/upload-element-binder/upload-resumable-element-binder";
import {UploadElementBinder} from "./services/upload-element-binder/upload-element-binder";

declare global {
    interface Window {
        __REDUX_DEVTOOLS_EXTENSION__: any;
        __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any
    }
}

export const uploadElementBinder: UploadElementBinder = new UploadResumableElementBinder();

const oneMiBInBytes = 1024 * 1024;
export const uploadController = new ResumableJsUploadController({
    endpoint: '/v1/files',
    chunkSizeInBytes: oneMiBInBytes,
    simultaneousChunkAmount: 4
});

uploadElementBinder.onFileAdded((file) => uploadController.uploadFile(file));

const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const middleware = composeEnhancer(applyMiddleware(fileUploadMiddleware(uploadController)));

const store = createStore(
    rootReducer,
    middleware
);

mapUploadControllerActionsToDispatch(uploadController, store.dispatch);

ReactDOM.render(
    <Provider store={store}>
        <App/>
    </Provider>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

