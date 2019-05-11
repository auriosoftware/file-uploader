import React from 'react';
import {connect} from "react-redux";
import style from './home.module.scss';
import {RootState} from "../../store/root.state";
import {File} from "../../store/files/files.state";
import FileUploader from "./file-uploader/file-uploader";
import {default as FileComponent} from "./file/file";
import {uploadElementBinder} from "../../resources";

export interface PropsFromStore {
    uploadingFiles: Array<File>;
}

function mapStateToProps(state: RootState): PropsFromStore {
    return {uploadingFiles: state.files};
}

type Props = PropsFromStore;

const Home = (props: Props) => {
    return (
        <div className="Home">
            <FileUploader uploadElementBinder={uploadElementBinder}/>
            {renderUploadingFiles(props.uploadingFiles)}
        </div>
    );

    function renderUploadingFiles(uploadingFiles: Array<File>): Array<JSX.Element> {
        return uploadingFiles.map((file) => <FileComponent key={file.id} uploadingFile={file}/>);
    }
};

export default connect(mapStateToProps)(Home);
