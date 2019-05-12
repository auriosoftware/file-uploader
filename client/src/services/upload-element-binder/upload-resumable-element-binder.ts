import { UploadElementBinder } from './upload-element-binder';
import Resumable from 'resumablejs';
import { signal } from '../../utils/signal';

export class UploadResumableElementBinder implements UploadElementBinder {

   private resumable: Resumable = new Resumable({
      generateUniqueIdentifier: () => Math.random().toString()
   });

   constructor() {
      this.resumable.on('fileAdded', (resumableFile: Resumable.ResumableFile) => {
         this.resumable.cancel();
         this.onFileAdded.fire(resumableFile.file);
      });
   }

   public onFileAdded = signal<File>();

   public setDropZoneElement(htmlElement: HTMLElement): void {
      this.resumable.assignDrop(htmlElement);
   }

   public setFileInputElement(htmlElement: HTMLElement): void {
      const allowFolderUpload = false;
      this.resumable.assignBrowse(htmlElement, allowFolderUpload);
   }

}
