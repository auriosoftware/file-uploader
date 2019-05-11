import React from 'react';
import style from './file.module.scss';
import { File, FileId } from "../../../store/files/files.state";
import { Card, Grow, IconButton, LinearProgress } from "@material-ui/core";
import ClearIcon from '@material-ui/icons/Clear';
import CheckIcon from '@material-ui/icons/Check';
import LoopIcon from '@material-ui/icons/Loop';
import ErrorIcon from '@material-ui/icons/Error';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
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
                    {isUploadSuccessful() && renderDownloadButton()}
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
                return <CheckIcon className={`${style.statusIcon} ${style.done}`}/>;
            case "failed":
                return <ErrorIcon className={`${style.statusIcon} ${style.failed}`}/>;
            case "uploading":
                return <LoopIcon className={`${style.statusIcon} ${style.uploading}`}/>;
        }
    }

    function renderDownloadButton(): JSX.Element {
        return <IconButton aria-label="Clear" onClick={() => window.location.href=`/v1/files/${props.file.name}`}>
            <CloudDownloadIcon/>
        </IconButton>
    }

    function renderProgressBar(): JSX.Element {
        return (
            <LinearProgress variant="determinate" value={props.file.progress}/>
        );
    }

    function isUploadInProgress(): boolean {
        return props.file.status === 'uploading';
    }

    function isUploadSuccessful(): boolean {
        return props.file.status === 'done';
    }

    function handleDeleteFile() {
        props.onAbortUpload(props.file.id)
    }
};
