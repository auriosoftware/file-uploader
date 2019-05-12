import { applyMiddleware, compose, createStore, Store } from 'redux';
import { rootReducer } from './root.reducer';
import { UploadController } from '../services/upload-controller/upload-controller';
import {
    connectUploadControllerToStore,
    mapActionsToUploadController
} from '../services/upload-controller/upload-controller-redux-connector';

declare global {
    interface Window {
        __REDUX_DEVTOOLS_EXTENSION__: any;
        __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any;
    }
}

export let store: Store;

export function initStore(uploadController: UploadController) {
    const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
    const middleware = composeEnhancer(applyMiddleware(mapActionsToUploadController(uploadController)));

    store = createStore(rootReducer, middleware);

    connectUploadControllerToStore(uploadController, store);
}
