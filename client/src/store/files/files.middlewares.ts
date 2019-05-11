import {isType} from "typescript-fsa";
import {FilesActions} from "./files.actions";
import {Middleware} from "redux";
import {UploadController} from "../../services/upload-controller";

export const fileUploadMiddleware = (ctrl: UploadController<Resumable.ResumableFile>): Middleware => store => next => action => {
    if(isType(action, FilesActions.deleteFile)) {
        ctrl.abortUpload(action.payload);
    }
    next(action);
};
