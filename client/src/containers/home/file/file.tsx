import React, {Ref} from 'react';
import {connect} from "react-redux";
import style from './file.module.scss';
import {FilesActions} from "../../../store/files/files.actions";
import {File, FileId} from "../../../store/files/files.state";
import {Fab, LinearProgress} from "@material-ui/core";
import DeleteIcon from '@material-ui/icons/Delete';

export interface PropsFromDispatch {
    deleteFile(fileId: FileId): void
}

function mapDispatchToProps(dispatch: any): PropsFromDispatch {
    return {
        deleteFile(fileId: FileId) {
            dispatch(FilesActions.deleteFile(fileId));
        }
    };
}

type Props = {
    uploadingFile: File
} & PropsFromDispatch;

const Component = (props: Props) => {
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

export default connect(undefined, mapDispatchToProps)(Component);
