import { Component, inject, input, InputSignal, SecurityContext } from '@angular/core';
import { Image } from '../../../../../../style/models/image';
import { Style } from '../../../../../../style/models/style';

import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ImageCroppedEvent, ImageCropperComponent, LoadedImage } from 'ngx-image-cropper';
import { CardFaceElementImageEditorService } from '../service/core/card-face-element-image-editor.service';
import { logInfo, stringify } from '../../../../../../../utils/utils';
import { ButtonComponent } from '../../../../../../../shared/button/button.component';

@Component({
  selector: 'app-card-face-element-image-editor',
  imports: [
    ButtonComponent,
    ImageCropperComponent
  ],
  templateUrl: './card-face-element-image-editor.component.html',
  styleUrl: './card-face-element-image-editor.component.scss'
})
export class CardFaceElementImageEditorComponent {
  private readonly cardFaceElementImageEditorService: CardFaceElementImageEditorService = inject<CardFaceElementImageEditorService>(CardFaceElementImageEditorService);

  // https://cloudinary.com/guides/automatic-image-cropping/5-ways-to-crop-images-in-html-css#:~:text=0%2C%205%25);%20%7D-,Crop%20with%20the%20clip-path()%20Function,of%20the%20image%20is%20hidden.
  // https://www.youtube.com/watch?v=lCClcI3Lt2A
  // https://stackblitz.com/edit/image-cropper?file=src%2Fimage-cropper%2Fcomponent%2Fimage-cropper.component.ts%3AL255

  public readonly $cardFaceImageAttr: InputSignal<{cardFaceImage: Image, cardFaceImageStyle?: Style } | undefined> = input<{cardFaceImage: Image, cardFaceImageStyle?: Style}>();
    
  protected imageChangedEvent: Event | null = null;
  protected croppedImage: SafeUrl = '';

  private readonly sanitizer: DomSanitizer = inject<DomSanitizer>(DomSanitizer);

  protected readonly style: Omit<Style, 'styleId'> = {
    fontSize: 'small',
    borderRadius: '5px',
    padding: '5px 9px',
    marginRight: '7px'
  };

  constructor() {
  }

  public fileChangeEvent(event: Event): void {
    this.imageChangedEvent = event;

    // CHECKME: The blob might not be revoked properly
    console.log(`%c${logInfo(this.constructor.name, this.fileChangeEvent.name)}: ${stringify(this.croppedImage)}`, 'color: #231942; background: #e0b1cb; padding: 5px; border-radius: 5px;');
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

  public onModifyCardFaceImage(event: Event): void {
    let src: string | null = this.sanitizer.sanitize(SecurityContext.URL, this.croppedImage);

    if (src) this.cardFaceElementImageEditorService.setUploadImage(src);
  }

  public onDisableImageEditor(event: Event): void {
   this.cardFaceElementImageEditorService.setDisableImageEditor('');
  }
}
