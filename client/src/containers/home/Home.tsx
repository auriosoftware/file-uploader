import React, {Ref} from 'react';
import {connect} from "react-redux";
import style from './Home.module.scss';
import {Button} from "@material-ui/core";
import {RootState, UploadingFile as IUploadingFile} from "../../reducers/root.state";
import FileUploader from "./file-uploader/FileUploader";
import UploadingFile from "./uploading-file/UploadingFile";

export interface PropsFromStore {
    uploadingFiles: Array<IUploadingFile>;
}

function mapStateToProps(state: RootState): PropsFromStore {
    return {uploadingFiles: state.uploadingFiles};
}

type Props = PropsFromStore;
type State = {}

class Home extends React.Component<Props, State> {

    componentDidMount(): void {
    }

    render() {
        return (
            <div className="Home">
                <FileUploader/>
                {this.props.uploadingFiles.map((file) => <UploadingFile key={file.id} uploadingFile={file}/>)}
            </div>
        );
    }

}

export default connect(mapStateToProps)(Home);
