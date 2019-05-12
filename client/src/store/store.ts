import { applyMiddleware, compose, createStore, Store } from 'redux';
import { rootReducer } from './root.reducer';
import { UploadController } from '../services/upload-controller/upload-controller';
import { connectUploadControllerToStore } from '../services/upload-controller/upload-controller-redux-connector';
import createSagaMiddleware from 'redux-saga';

declare global {
    interface Window {
        __REDUX_DEVTOOLS_EXTENSION__: any;
        __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any;
    }
}

export let store: Store;

export function initStore(uploadController: UploadController) {
    const sagaMiddleware = createSagaMiddleware();
    const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
    const middleware = composeEnhancer(applyMiddleware(sagaMiddleware));

    store = createStore(rootReducer, middleware);

    connectUploadControllerToStore(uploadController, store, sagaMiddleware);
}
