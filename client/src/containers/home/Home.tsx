import React, {Ref} from 'react';
import {connect} from "react-redux";
import style from './Home.module.scss';
import {RootState, UploadingFile} from "../../reducers/root.state";
import FileUploader from "./file-uploader/FileUploader";
import {default as UploadingFileComponent} from "./uploading-file/UploadingFile";

export interface PropsFromStore {
    uploadingFiles: Array<UploadingFile>;
}

function mapStateToProps(state: RootState): PropsFromStore {
    return {uploadingFiles: state.uploadingFiles};
}

type Props = PropsFromStore;

const Home: React.FC<Props> = (props) => {
    return (
        <div className="Home">
            <FileUploader/>
            {renderUploadingFiles(props.uploadingFiles)}
        </div>
    );

    function renderUploadingFiles(uploadingFiles: Array<UploadingFile>): Array<JSX.Element> {
        return uploadingFiles.map((file) => <UploadingFileComponent key={file.id} uploadingFile={file}/>);
    }
};

export default connect(mapStateToProps)(Home);
