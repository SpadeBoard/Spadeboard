import { Component, inject, ResourceRef } from '@angular/core';
// import { FileUploadApiService } from '../../services/file-upload-api.service';

@Component({
  selector: 'app-file-upload',
  imports: [],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.css'
})
export class FileUploadComponent {
  // FIXME: Fix the environment paths
  // private fileUploadApiService = inject(FileUploadApiService);
  
  url: string | undefined = '';
  file: File | undefined;

  fileName: string = '';
  requiredFileType: string = '';
  
  /// https://stackblitz.com/edit/angular-file-upload-preview?file=app%2Fapp.component.ts
  onFileSelected(event: any) {
   // Should override new file on old file
    if (event.target && event.target.files && event.target.files[0]) {
      var reader = new FileReader();

      this.file = event.target.files[0]; // Modify?
      reader.readAsDataURL(event.target.files[0]); // read file as data url

      reader.onload = (event: any) => { // called once readAsDataURL is completed
        this.url = (event.target || event.target.result) ?? '';
      }
    }
  }

  onCancelUpload(event: Event) {
    
  }

  // TODO: When we submit the file, we call the API and get the file again
  onSubmit(event: Event) {
    if (this.file) {
      /*let filePath: ResourceRef<string | undefined> = this.fileUploadApiService.uploadFile$(this.file);
      
      if (filePath !== undefined) 
      {
        // FIXME: Undefined path
        this.url = filePath.value;
      }*/
    }
  }
}
