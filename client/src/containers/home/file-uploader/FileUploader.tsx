import React, {Ref} from 'react';
import {connect} from "react-redux";
import style from './FileUploader.module.scss';
import {Button} from "@material-ui/core";
import Resumable from 'resumablejs';
import {UploadingFilesActions} from "../../../reducers/uploading-files/uploading-files.actions";
import {RootState} from "../../../reducers/root.state";

declare global {
    interface Window {
        Resumable: any;
    }
}

export interface PropsFromStore {
    uploadingFiles: Array<any>;
}

export interface PropsFromDispatch {
    uploadFile(file: Resumable.ResumableFile): void
}

function mapStateToProps(state: RootState): PropsFromStore {
    return {uploadingFiles: state.uploadingFiles};
}

function mapDispatchToProps(dispatch: any): PropsFromDispatch {
    return {
        uploadFile(file: Resumable.ResumableFile) {
            dispatch(UploadingFilesActions.uploadFile(file));
        }
    };
}

type Props = PropsFromDispatch & PropsFromStore;
type State = {}

class FileUploader extends React.Component<Props, State> {

    private resumable: any;
    private dropArea: any;
    private dropButton: any;

    constructor(props: Props) {
        super(props);
        this.dropArea = React.createRef();
        this.dropButton = React.createRef();
        this.resumable = new window.Resumable({
            target: '',
            query: {upload_token: 'my_token'}
        });
    }

    componentDidMount(): void {
        this.resumable.assignDrop(this.dropArea.current);
        this.resumable.assignBrowse(this.dropButton.current);
        this.resumable.on('fileAdded', (file: Resumable.ResumableFile) => {
            this.props.uploadFile(file);
        });
        this.resumable.on('fileSuccess', (file: any) => {
            console.log('FILE SUCCESS!');
        });
        this.resumable.on('fileError', (file: any) => {
            console.log('FILE ERROR!');
        });
    }

    render() {
        return (
            <div className="App">
                <input
                    ref={this.dropButton}
                    accept="*"
                    id="contained-button-file"
                    type="file"
                    className={style.uploadInput}
                />
                <label htmlFor="contained-button-file">
                    <Button variant="contained" component="span">
                        Upload
                    </Button>
                </label>
                <section className={style.dropContainer} ref={this.dropArea}>
                    DROP ME PLS
                </section>
            </div>
        );
    }

}

export default connect(mapStateToProps, mapDispatchToProps)(FileUploader);
