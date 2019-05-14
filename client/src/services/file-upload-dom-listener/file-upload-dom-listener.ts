import { SignalHandler } from '../../utils/signal';

export interface FileUploadDOMListener {
   setDropZoneElement(htmlElement: HTMLElement): void;
   setFileInputElement(htmlElement: HTMLElement): void;
   onFileAdded(handler: SignalHandler<File>): void;
}
