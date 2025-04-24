import { Component, computed, effect, inject, input, InputSignal, output, OutputEmitterRef, Signal } from '@angular/core';
import { Style } from '../../../style/models/style';
import { Image } from '../../../style/models/image';
import { CLOSE_IMAGE_EDITOR_TOKEN } from '../../../../shared/tokens';

@Component({
  selector: 'app-card-face-image',
  imports: [],
  templateUrl: './card-face-image.component.html',
  styleUrl: './card-face-image.component.css'
})
export class CardFaceImageComponent {
  constructor() {
    effect(() => {
      let cardFaceImageAttr = this.cardFaceImageAttrComputed();
      
      if (cardFaceImageAttr === undefined)
        return;
      
      this.setImage(cardFaceImageAttr.cardFaceImage);

      if (cardFaceImageAttr.cardFaceImageStyle)
        this.setImageStyle(cardFaceImageAttr.cardFaceImageStyle);
    });
  }

  cardFaceImageAttr: InputSignal<{cardFaceImage: Image, cardFaceImageStyle?: Style } | undefined> = input<{cardFaceImage: Image, cardFaceImageStyle?: Style}>();
  readonly cardFaceImageAttrComputed: Signal<{ cardFaceImage: Image; cardFaceImageStyle?: Style | undefined; } | undefined>= computed(() => 
    {
      let cardFaceImageAttr: {
          cardFaceImage: Image;
          cardFaceImageStyle?: Style;
      } | undefined = this.cardFaceImageAttr();

      // console.log('Card face image attributes computed', cardFaceImageAttr);

      if (cardFaceImageAttr === undefined)
        return undefined;

      return cardFaceImageAttr;
    }); 

  // TODO: Emit back the cardFaceElementID
  showImageEditor: OutputEmitterRef<number> = output<number>();
  // TODO: Remove and put in the image editor
  // showImageEditorInject: (showImageEditor: boolean) => void  = inject(CLOSE_IMAGE_EDITOR_TOKEN);
  
  // TODO: Have an input signal that both its parent can pass into
  // and its child can emit into
  isOpeningImageEditor: boolean = false;
  private _img: Image = {
    imageId: 0,
    src: 'https://www.charitycomms.org.uk/wp-content/uploads/2019/02/placeholder-image-square.jpg',
    alt: 'Placeholder square image',
    width: 100,
    height: 100
  }

  private _imgContainerStyle: Style = {
    styleId: 0
  }

  private _imgStyle: Style = {
    styleId: 0
  }

  // TODO: Get placeholder image
  // TODO: Filter out style ID because it's possible to throw an error for HTML class due to it not having a styleId property?
  getImageContainerStyle(): Omit<Style, 'styleId'> {
    return this._imgContainerStyle;
  }

  setImageContainerStyle(style?: Style) {
    let placeholder: Style = {
      styleId: 0,
      display: 'flex',
      aspectRatio: '1/1',
      width: '5%',
      height: 'auto',
    };

    this._imgContainerStyle = style ?? placeholder;
  }

  getImageStyle(): Omit<Style, 'styleId'> {
    return this._imgStyle;
  }

  setImageStyle(style?: Style) {
    let placeholder: Style = {
      styleId: 0,
      display: 'flex',
      aspectRatio: '1/1',
      width: '5%',
      height: 'auto',
    };

    this._imgStyle = style ?? placeholder;
  }

  getImage(): Omit<Image, 'imageId'> {
    return this._img;
  }

  // FIXME: There's no width and height being passed in so it also defaults to 0
  // Figure out how you can have the image without setting the width and height, probably have to do some dynamic @if in the HTML?
  setImage(img: Image) {
    this._img = img;
  }

  // TODO: Add image to it, open a new menu to upload image file?
  onOpenImageEditor(event: Event) {
    let cardFaceElementId: number | undefined = this.cardFaceImageAttr()?.cardFaceImage.imageId;

    console.log(`Card face element ID: ${cardFaceElementId}`);

    if (cardFaceElementId !== undefined)
      this.showImageEditor.emit(cardFaceElementId);
  }

  onImageLoad(url: string) {
    if (!url.startsWith('blob:'))
      return;

    URL.revokeObjectURL(url);
    console.log('Blob URL revoked after image loaded');
  }
}
