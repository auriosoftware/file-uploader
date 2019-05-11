export interface UploadElementBinder {
   setDropZoneElement(htmlElement: HTMLElement): void;
   setFileInputElement(htmlElement: HTMLElement): void;
   onFileAdded(cb: (file: File) => void): void;
}
