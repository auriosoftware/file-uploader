import React, {useEffect, useRef} from 'react';
import style from './FileUploader.module.scss';
import {Button} from "@material-ui/core";

interface UploadElementBinder {
    setDropZoneElement(htmlElement: HTMLElement): void;
    setFileInputElement(htmlElement: HTMLElement): void;
}

interface CustomProps {
    uploadElementBinder: UploadElementBinder
}

type Props = CustomProps;

const FileUploader = (props: Props) => {
    const uploadButtonElement = useRef<HTMLInputElement>(null);
    const dropAreaElement = useRef<HTMLElement>(null);

    useEffect(() => {
        if(uploadButtonElement.current && dropAreaElement.current) {
            props.uploadElementBinder.setDropZoneElement(dropAreaElement.current);
            props.uploadElementBinder.setFileInputElement(uploadButtonElement.current);
        }
    });

    return (
        <div className="App">
            <input
                ref={uploadButtonElement}
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
            <section className={style.dropContainer} ref={dropAreaElement}>
                DROP ME PLS
            </section>
        </div>
    );
};

export default FileUploader;
