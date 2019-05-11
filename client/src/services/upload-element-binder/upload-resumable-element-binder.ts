import {UploadElementBinder} from "./upload-element-binder";
import Resumable from 'resumablejs';
import {signal} from "../../utils/signal";

export class UploadResumableElementBinder implements UploadElementBinder {

   private resumable: Resumable = new Resumable({});

   constructor() {
      this.resumable.on('fileAdded', (resumableFile: Resumable.ResumableFile) => {
         this.onFileAdded.fire(resumableFile.file);
      });
   }

   onFileAdded = signal<File>();

   setDropZoneElement(htmlElement: HTMLElement): void {
      this.resumable.assignDrop(htmlElement);
   }

   setFileInputElement(htmlElement: HTMLElement): void {
      const allowFolderUpload = false;
      this.resumable.assignBrowse(htmlElement, allowFolderUpload);
   }

}
