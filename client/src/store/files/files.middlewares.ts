import {isType} from "typescript-fsa";
import {FilesActions} from "./files.actions";
import {Middleware} from "redux";
import {UploadController} from "../../services/upload-controller";

export const fileUploadMiddleware = (uploadController: UploadController<Resumable.ResumableFile>): Middleware => store => next => action => {
    if(isType(action, FilesActions.abortFile)) {
        uploadController.abortUpload(action.payload);
    }
    next(action);
};
