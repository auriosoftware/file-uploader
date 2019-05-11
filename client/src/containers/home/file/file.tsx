import React from 'react';
import style from './file.module.scss';
import { File, FileId } from "../../../store/files/files.state";
import { Card, Grow, IconButton, LinearProgress } from "@material-ui/core";
import ClearIcon from '@material-ui/icons/Clear';
import CheckIcon from '@material-ui/icons/Check';
import LoopIcon from '@material-ui/icons/Loop';
import ErrorIcon from '@material-ui/icons/Error';

export interface Props {
    file: File
    onAbortUpload(fileId: FileId): void
}

export const FileComponent = (props: Props) => {
    return (
        <Grow in={true}>
            <Card className={style.rootLayout} data-test="file" data-test-file-name={props.file.name}>
                <div className={style.titleRow}>
                    {renderStatusIcon()}
                    <div className={style.title}>{props.file.name}</div>
                    <IconButton aria-label="Clear" onClick={handleDeleteFile}>
                        <ClearIcon/>
                    </IconButton>
                </div>
                {isUploadInProgress() && renderProgressBar()}
            </Card>
        </Grow>
    );



    function renderStatusIcon(): JSX.Element {
        switch (props.file.status) {
            case "done":
                return <CheckIcon className={style.statusIcon}/>;
            case "failed":
                return <ErrorIcon className={style.statusIcon}/>;
            case "uploading":
                return <LoopIcon className={style.rotatingStatusIcon}/>;
        }
    }

    function renderProgressBar(): JSX.Element {
        return (
            <LinearProgress variant="determinate" value={props.file.progress}/>
        );
    }

    function isUploadInProgress(): boolean {
        return props.file.status === 'uploading';
    }

    function handleDeleteFile() {
        props.onAbortUpload(props.file.id)
    }
};
