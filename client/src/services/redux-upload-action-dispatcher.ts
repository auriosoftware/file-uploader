import {UploadController} from "./upload-controller";
import Resumable from 'resumablejs';
import {FilesActions} from "../store/files/files.actions";
import {Dispatch} from "redux";
import {File} from "../store/files/files.state";

export const mapUploadControllerActionsToDispatch = (controller: UploadController<Resumable.ResumableFile>, dispatch: Dispatch) => {
    controller.onFileAdded((file) => dispatch(FilesActions.uploadFile.started({size: file.size, name: file.fileName, id: file.uniqueIdentifier})));
    controller.onFileProgress((file) => dispatch(FilesActions.updateFileProgress({progress: file.progress(true) * 100, fileId: file.uniqueIdentifier})));
    controller.onFileUploadFailed((file) => dispatch(FilesActions.uploadFile.failed({error: new Error(), params: {size: file.size, name: file.fileName, id: file.uniqueIdentifier}})));
    controller.onFileUploaded((file) => dispatch(FilesActions.uploadFile.done({params: {name: file.fileName, id: file.uniqueIdentifier, size: file.size}})));
};

//
//
// export const ResumableJsFileAdapter = {
//     convertToDomain: (resumableFile: Resumable.ResumableFile): File => {
//         return {error: '', id: resumableFile.uniqueIdentifier, name: resumableFile.fileName, }
//     },
//     convertToFileAddedActionPayload()
// };