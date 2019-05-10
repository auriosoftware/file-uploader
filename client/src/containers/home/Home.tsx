import React, {Ref} from 'react';
import {connect} from "react-redux";
import style from './Home.module.scss';
import {RootState} from "../../store/root.state";
import {File} from "../../store/files/files.state";
import FileUploader from "./file-uploader/FileUploader";
import {default as UploadingFileComponent} from "./uploading-file/UploadingFile";
import {ResumableJsUploadController} from "../../services/resumable-js-upload-controller";

export interface PropsFromStore {
    uploadingFiles: Array<File>;
}

function mapStateToProps(state: RootState): PropsFromStore {
    return {uploadingFiles: state.files};
}

type Props = PropsFromStore;

export const uploadElementBinder = new ResumableJsUploadController('/v1/files');

const Home = (props: Props) => {
    return (
        <div className="Home">
            <FileUploader uploadElementBinder={uploadElementBinder}/>
            {renderUploadingFiles(props.uploadingFiles)}
        </div>
    );

    function renderUploadingFiles(uploadingFiles: Array<File>): Array<JSX.Element> {
        return uploadingFiles.map((file) => <UploadingFileComponent key={file.id} uploadingFile={file}/>);
    }
};

export default connect(mapStateToProps)(Home);
