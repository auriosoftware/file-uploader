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
        <div className={style.container} data-test="file" data-test-file-name={props.uploadingFile.name}>
            Uploading: {props.uploadingFile.name}
            {renderDeleteButton()}
            {renderProgress()}
        </div>
    );

    function renderDeleteButton(): JSX.Element {
        return (
            <Fab aria-label="Delete" size={"small"} onClick={handleDeleteFile} disabled={isUploadFinished()}>
                <DeleteIcon />
            </Fab>
        );
    }

    function renderProgress(): JSX.Element {
        return (
            <LinearProgress variant="determinate" value={props.uploadingFile.progress} />
        );
    }

    function isUploadFinished(): boolean {
        return props.uploadingFile.progress >= 100;
    }

    function handleDeleteFile() {
        props.deleteFile(props.uploadingFile.id)
    }
};

export default connect(undefined, mapDispatchToProps)(Component);
