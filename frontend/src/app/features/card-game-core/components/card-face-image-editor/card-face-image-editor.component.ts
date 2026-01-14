import { Component, inject, input, InputSignal, output, OutputEmitterRef, SecurityContext } from '@angular/core';
import { Image } from '../../../style/models/image';
import { Style } from '../../../style/models/style';

import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ImageCroppedEvent, ImageCropperComponent, LoadedImage } from 'ngx-image-cropper';
import { CardEditorControlsDesignImageService } from '../../services/card-game-core/card-editor/controls/design/card-face-elements/card-editor-controls-design-image.service';

@Component({
  selector: 'app-card-face-image-editor',
  imports: [
    // FileUploadComponent,
    ImageCropperComponent
  ],
  templateUrl: './card-face-image-editor.component.html',
  styleUrl: './card-face-image-editor.component.scss'
})
export class CardFaceImageEditorComponent {
  private cardEditorControlsDesignImageService: CardEditorControlsDesignImageService = inject(CardEditorControlsDesignImageService);

  // https://cloudinary.com/guides/automatic-image-cropping/5-ways-to-crop-images-in-html-css#:~:text=0%2C%205%25);%20%7D-,Crop%20with%20the%20clip-path()%20Function,of%20the%20image%20is%20hidden.
  // https://www.youtube.com/watch?v=lCClcI3Lt2A
  // https://stackblitz.com/edit/image-cropper?file=src%2Fimage-cropper%2Fcomponent%2Fimage-cropper.component.ts%3AL255

  public readonly $cardFaceImageAttr: InputSignal<{cardFaceImage: Image, cardFaceImageStyle?: Style } | undefined> = input<{cardFaceImage: Image, cardFaceImageStyle?: Style}>();
    
  protected imageChangedEvent: Event | null = null;
  protected croppedImage: SafeUrl = '';
  
  // fileUploadComponent: FileUploadComponent = inject(FileUploadComponent);
  private sanitizer: DomSanitizer = inject(DomSanitizer);
  private src: string = "";

  public readonly $closed: OutputEmitterRef<void> = output<void>();

  constructor() {
  }

  public fileChangeEvent(event: Event): void {
    this.imageChangedEvent = event;

    // this.fileUploadComponent.onFileSelected(event);
  }

  public imageCropped(event: ImageCroppedEvent): void {
    if (event.objectUrl)
      this.croppedImage = this.sanitizer.bypassSecurityTrustUrl(event.objectUrl);
    // event.blob can be used to upload the cropped image
  }

  public imageLoaded(image: LoadedImage): void {
    // show cropper
  }

  public cropperReady(): void {
    // cropper ready
  }

  public loadImageFailed(): void {
    // show message
  }

  public onModifyCardFaceImage(event: Event): void /*Promise<void>*/ {
    let src: string | null = this.sanitizer.sanitize(SecurityContext.URL, this.croppedImage);

    if (src) this.src = src;

    // CHECKME: Do we want this as a flag
    this.closeImageEditor();
  }

  public onDisableImageEditor(event: Event): void {
   this.closeImageEditor();
  }

  private closeImageEditor(): void {
    this.cardEditorControlsDesignImageService.setDisableImageEditor(this.src);
    this.$closed.emit();
  }
}
