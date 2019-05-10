import React, {Ref} from 'react';
import {connect} from "react-redux";
import style from './UploadingFile.module.scss';
import {UploadingFilesActions} from "../../../reducers/uploading-files/uploading-files.actions";
import {RootState, UploadingFile, UploadingFileId} from "../../../reducers/root.state";
import {Fab, LinearProgress} from "@material-ui/core";
import DeleteIcon from '@material-ui/icons/Delete';

export interface PropsFromStore {
}

function mapStateToProps(state: RootState): PropsFromStore {
    return {
    };
}

export interface PropsFromDispatch {
    deleteFile(fileId: UploadingFileId): void
}

function mapDispatchToProps(dispatch: any): PropsFromDispatch {
    return {
        deleteFile(fileId: UploadingFileId) {
            dispatch(UploadingFilesActions.deleteFile(fileId));
        }
    };
}

type Props = {
    uploadingFile: UploadingFile
} & PropsFromDispatch & PropsFromStore;

const Component: React.FC<Props> = (props) => {
    return (
        <div className={style.container}>
            Uploading: {props.uploadingFile.name}
            <Fab aria-label="Delete" size={"small"} onClick={handleDeleteFile} disabled={isUploadFinished()}>
                <DeleteIcon />
            </Fab>
            <LinearProgress variant="determinate" value={props.uploadingFile.progress} />
        </div>
    );

    function isUploadFinished(): boolean {
        return props.uploadingFile.progress >= 100;
    }

    function handleDeleteFile() {
        props.deleteFile(props.uploadingFile.id)
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);
