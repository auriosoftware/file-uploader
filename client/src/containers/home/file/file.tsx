import React from 'react';
import style from './file.module.scss';
import { File } from "../../../store/files/files.state";
import { Card, Grow, IconButton, LinearProgress } from "@material-ui/core";
import ClearIcon from '@material-ui/icons/Clear';
import CheckIcon from '@material-ui/icons/Check';
import LoopIcon from '@material-ui/icons/Loop';
import ErrorIcon from '@material-ui/icons/Error';
import AbortedIcon from '@material-ui/icons/Cancel';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';

export interface Props {
    file: File
    onAbortUpload(): void
    onDownload(): void;
}

export const FileComponent = (props: Props) => {
    return (
        <Grow in={true}>
            <Card className={style.rootLayout}>
                <div className={style.titleRow}>
                    {renderStatusIcon()}
                    {renderFileName()}
                    {isUploadSuccessful() && renderDownloadButton()}
                    {isUploadInProgress() && renderAbortButton()}
                </div>
                {isUploadInProgress() && renderProgressBar()}
            </Card>
        </Grow>
    );


    function renderStatusIcon(): JSX.Element {
        switch (props.file.status) {
            case "done":
                return <CheckIcon data-test-done-icon className={`${style.statusIcon} ${style.done}`}/>;
            case "aborted":
                return <AbortedIcon data-test-aborted-icon className={`${style.statusIcon} ${style.failed}`}/>;
            case "failed":
                return <ErrorIcon data-test-failed-icon className={`${style.statusIcon} ${style.failed}`}/>;
            case "uploading":
                return <LoopIcon data-test-uploading-icon className={`${style.statusIcon} ${style.uploading}`}/>;
        }
    }

    function renderFileName(): JSX.Element {
        return <div className={style.title}>{props.file.name}</div>;
    }

    function renderDownloadButton(): JSX.Element {
        return <IconButton data-test-download-button aria-label="Download" onClick={props.onDownload}>
            <CloudDownloadIcon data-test-download-icon/>
        </IconButton>
    }

    function renderAbortButton(): JSX.Element {
        return <IconButton data-test-abort-button aria-label="Clear" onClick={props.onAbortUpload}>
            <ClearIcon/>
        </IconButton>;
    }

    function renderProgressBar(): JSX.Element {
        return (
            <LinearProgress data-test-progress variant="determinate" value={props.file.progress}/>
        );
    }

    function isUploadInProgress(): boolean {
        return props.file.status === 'uploading';
    }

    function isUploadSuccessful(): boolean {
        return props.file.status === 'done';
    }
};
