export interface UploadController<T> {
    setDropZoneElement(htmlElement: HTMLElement): void;
    setFileInputElement(htmlElement: HTMLElement): void;
    onFileAdded(cb: (file: T) => void): void;
    onFileUploaded(cb: (file: T) => void): void;
    onFileUploadFailed(cb: (file: T) => void): void;
    onFileProgress(cb: (file: T) => void): void;
}

// this.resumable = new Resumable({
//     target: '/v1/files',
//     query: {upload_token: 'my_token'}
// });
//
// this.resumable.assignDrop(this.dropArea.current);
// this.resumable.assignBrowse(this.dropButton.current, false);
//
// this.resumable.on('fileAdded', (file: Resumable.ResumableFile) => {
//     this.resumable.upload();
//     this.props.uploadFile({id: file.uniqueIdentifier, name: file.fileName, size: file.size});
// });
// this.resumable.on('fileSuccess', (file: Resumable.ResumableFile) => {
//     console.log('FILE SUCCESS!');
// });
// this.resumable.on('fileError', (file: Resumable.ResumableFile) => {
//     console.log('FILE ERROR!');
// });
// this.resumable.on('fileProgress', (file: Resumable.ResumableFile) => {
//     this.props.updateFileProgress(file.uniqueIdentifier, file.progress(true) * 100);
// });
