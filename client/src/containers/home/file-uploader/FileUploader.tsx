import React, {Ref} from 'react';
import {connect} from "react-redux";
import style from './FileUploader.module.scss';
import {Button} from "@material-ui/core";
import Resumable from 'resumablejs';
import {
    UpdateFileProgressPayload, UploadFilePayload,
    UploadingFilesActions
} from "../../../reducers/uploading-files/uploading-files.actions";
import {RootState, UploadingFile, UploadingFileId} from "../../../reducers/root.state";

declare global {
    interface Window {
        Resumable: any;
    }
}

export interface PropsFromStore {
    uploadingFiles: Array<any>;
}

export interface PropsFromDispatch {
    uploadFile(file: UploadFilePayload): void
    updateFileProgress(fileId: UploadingFileId, progress: number): void
}

function mapStateToProps(state: RootState): PropsFromStore {
    return {uploadingFiles: state.uploadingFiles};
}

function mapDispatchToProps(dispatch: any): PropsFromDispatch {
    return {
        uploadFile(file: UploadFilePayload) {
            dispatch(UploadingFilesActions.uploadFile(file));
        },
        updateFileProgress(fileId: UploadingFileId, progress: number) {
            dispatch(UploadingFilesActions.updateFileProgress({fileId, progress}));
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
            this.props.uploadFile({id: file.uniqueIdentifier, name: file.fileName, size: file.size});
            (() => {
                let progress = 0;
                setInterval(() => {
                    if(progress >= 100) {
                        return;
                    }
                    progress += 10;
                    this.props.updateFileProgress(file.uniqueIdentifier, progress)
                }, 1000);
            })()
        });
        this.resumable.on('fileSuccess', (file: Resumable.ResumableFile) => {
            console.log('FILE SUCCESS!');
        });
        this.resumable.on('fileError', (file: Resumable.ResumableFile) => {
            console.log('FILE ERROR!');
        });
        this.resumable.on('fileProgress', (file: Resumable.ResumableFile) => {
            this.props.updateFileProgress(file.uniqueIdentifier, file.progress(true));
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
