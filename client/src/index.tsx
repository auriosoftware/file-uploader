import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import {Provider} from 'react-redux';
import {createStore, applyMiddleware} from "redux";
import {rootReducer} from "./store/root.reducer";
import createSagaMiddleware from 'redux-saga';
import {mapUploadControllerActionsToDispatch} from "./services/redux-upload-action-dispatcher";
import {uploadElementBinder} from "./containers/home/Home";

declare global {
    interface Window {
        __REDUX_DEVTOOLS_EXTENSION__: any;
    }
}

const sagaMiddleware = createSagaMiddleware();
// const middleware = applyMiddleware(sagaMiddleware);

// sagaMiddleware.run();

const store = createStore(
    rootReducer,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
    // middleware
);

mapUploadControllerActionsToDispatch(uploadElementBinder, store.dispatch);

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
