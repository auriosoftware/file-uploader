import React, { useEffect, useRef } from 'react';
import style from './file-upload-drop-box.module.scss';
import { Button } from '@material-ui/core';
import { FileUploadDOMListener } from '../../../services/file-upload-dom-listener/file-upload-dom-listener';

interface CustomProps {
    fileUploadDOMListener: FileUploadDOMListener;
}

type Props = CustomProps;

export const FileUploadDropBox = (props: Props) => {
    const uploadButtonElement = useRef<HTMLInputElement>(null);
    const dropAreaElement = useRef<HTMLElement>(null);

    useEffect(() => {
        if (uploadButtonElement.current && dropAreaElement.current) {
            props.fileUploadDOMListener.setDropZoneElement(dropAreaElement.current);
            props.fileUploadDOMListener.setFileInputElement(uploadButtonElement.current);
        }
    });

    return (
        <div className='App'>
            {renderDropZone()}
        </div>
    );

    function renderDropZone(): JSX.Element {
        return (
            <section className={style.dropContainer} ref={dropAreaElement}>
                <input
                    ref={uploadButtonElement}
                    accept='*'
                    id='contained-button-file'
                    type='file'
                    data-test='file-upload-input'
                    className={style.uploadInput}
                />
                <label htmlFor='contained-button-file'>
                    <Button variant='contained' component='span'>
                        Click or drop a file here!
                    </Button>
                </label>
            </section>
        );
    }
};
