import React from 'react';
import { connect } from 'react-redux';
import style from './home.module.scss';
import { RootState } from '../../store/root.state';
import { File, FileId } from '../../store/files/files.state';
import { FileUploadDropBox } from './file-upload-drop-box/file-upload-drop-box';
import { FileComponent } from './file/file';
import { apiRoutes, fileUploadDOMListener } from '../../resources';
import { Dispatch } from 'redux';
import { FilesActions } from '../../store/files/files.actions';
import { orderedFilesListSelector } from '../../store/files/files.selectors';

export interface PropsFromStore {
    files: Array<File>;
}

export interface PropsFromDispatch {
    abortUpload: (file: FileId) => void;
}

function mapStateToProps(state: RootState): PropsFromStore {
    return {
        files: orderedFilesListSelector(state)
    };
}

function mapDispatchToProps(dispatch: Dispatch): PropsFromDispatch {
    return {
        abortUpload: (fileId: FileId) => dispatch(FilesActions.abortFile(fileId))
    };
}

type Props = PropsFromStore & PropsFromDispatch;

const HomeComponent = (props: Props) => {
    return (
        <div className={style.rootContainer}>
            <FileUploadDropBox fileUploadDOMListener={fileUploadDOMListener}/>
            {renderUploadingFiles(props.files)}
        </div>
    );

    function renderUploadingFiles(uploadingFiles: Array<File>): Array<JSX.Element> {
        return uploadingFiles.map((file) => (
            <FileComponent key={file.id}
                           data-test-file
                           data-test-file-name={file.name}
                           file={file}
                           onAbortUpload={() => props.abortUpload(file.id)}
                           onDownload={() => downloadFile(file.name)}
            />
        ));
    }
};

function downloadFile(fileName: string) {
    window.location.href = apiRoutes.download(fileName);
}

export const ConnectedHomeComponent = connect(mapStateToProps, mapDispatchToProps)(HomeComponent);
