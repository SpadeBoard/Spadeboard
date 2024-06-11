import { Component, computed, inject, input, InputSignal, output, SecurityContext } from '@angular/core';
import { FileUploadComponent } from '../../../../utils/components/file-upload/file-upload.component';
import { Style } from '../../../style/models/style';
import { Image } from '../../../style/models/image';

import { ImageCropperComponent, ImageCroppedEvent, LoadedImage } from 'ngx-image-cropper';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CLOSE_IMAGE_EDITOR_TOKEN, CROPPED_IMAGE_TOKEN } from '../../../../shared/tokens';
import { onLoadReadBlobAsBase64, safeUrlToBlob } from '../../../../utils/utils';

@Component({
  selector: 'app-card-face-image-editor',
  imports: [
    // FileUploadComponent,
    ImageCropperComponent
  ],
  templateUrl: './card-face-image-editor.component.html',
  styleUrl: './card-face-image-editor.component.css'
})
export class CardFaceImageEditorComponent {
  // https://cloudinary.com/guides/automatic-image-cropping/5-ways-to-crop-images-in-html-css#:~:text=0%2C%205%25);%20%7D-,Crop%20with%20the%20clip-path()%20Function,of%20the%20image%20is%20hidden.
  // https://www.youtube.com/watch?v=lCClcI3Lt2A
  // https://stackblitz.com/edit/image-cropper?file=src%2Fimage-cropper%2Fcomponent%2Fimage-cropper.component.ts%3AL255

  cardFaceImageAttr: InputSignal<{cardFaceImage: Image, cardFaceImageStyle?: Style } | undefined> = input<{cardFaceImage: Image, cardFaceImageStyle?: Style}>();
  readonly cardFaceImageAttrComputed = computed(() => 
    {
      let cardFaceImageAttr: {
          cardFaceImage: Image;
          cardFaceImageStyle?: Style;
      } | undefined = this.cardFaceImageAttr();

      if (cardFaceImageAttr === undefined)
        return;

      //this.setImage(cardFaceImageAttr.cardFaceImage);

      if (cardFaceImageAttr.cardFaceImageStyle)
        console.log('Has image style');
        //this.setImageStyle(cardFaceImageAttr.cardFaceImageStyle);
    }); 
    
  imageChangedEvent: Event | null = null;
  croppedImage: SafeUrl = '';

  closeImageEditorInject: (showImageEditor: boolean) => void  = inject(CLOSE_IMAGE_EDITOR_TOKEN);
  cardFaceImageElementSrcInject: (croppedImage: string) => void  = inject(CROPPED_IMAGE_TOKEN);
  
  // fileUploadComponent: FileUploadComponent = inject(FileUploadComponent);
  private sanitizer: DomSanitizer = inject(DomSanitizer);

  fileChangeEvent(event: Event): void {
    this.imageChangedEvent = event;

    // this.fileUploadComponent.onFileSelected(event);
  }
  imageCropped(event: ImageCroppedEvent) {
    if (event.objectUrl)
      this.croppedImage = this.sanitizer.bypassSecurityTrustUrl(event.objectUrl);
    // event.blob can be used to upload the cropped image
  }
  imageLoaded(image: LoadedImage) {
    // show cropper
  }
  cropperReady() {
    // cropper ready
  }
  loadImageFailed() {
    // show message
  }

  // TODO: On submit the card face editor, upload the file to the database
  // And then emit that
  /*async*/ onModifyCardFaceImage(event: Event): void /*Promise<void>*/ {
    /*try
    {
      let blob: Blob | null = await safeUrlToBlob(this.croppedImage);
      
      // TODO: Replace with file blob url
      let src: string | null = this.sanitizer.sanitize(SecurityContext.URL, this.croppedImage);

      /*if (blob !== null) {
        // Convert the Blob to a Base64 string
        let src: string = await onLoadReadBlobAsBase64(blob);
  
        // Use the Base64 string as the source for the card face image
        this.cardFaceImageElementSrcInject(src);
      } else {
        console.error('Failed to convert SafeURL to Blob.');
      }
    }
    catch (error) {

    }*/

    let src: string | null = this.sanitizer.sanitize(SecurityContext.URL, this.croppedImage);

    if (src) {
      this.cardFaceImageElementSrcInject(src);
    }
  }

  // TODO: Inside of card-face-image, we'd want to load that image if it exists

  onCloseCardFaceImageEditor(event: Event): void {
    this.closeImageEditorInject(false);
  }
}
