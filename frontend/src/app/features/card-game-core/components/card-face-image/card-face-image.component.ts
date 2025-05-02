import { Component, computed, effect, HostListener, inject, input, InputSignal, output, OutputEmitterRef, Signal } from '@angular/core';
import { FileUploadApiService } from '../../../../utils/services/file-upload-api.service';
import { EMPTY, Observable, Subscriber, switchMap } from 'rxjs';
import { CardEditorControlsDesignImageService } from '../../services/card-editor-controls-design-image.service';
import { clamp } from '../../../../utils/utils';

@Component({
  selector: 'app-card-face-image',
  imports: [],
  templateUrl: './card-face-image.component.html',
  styleUrl: './card-face-image.component.css'
})
export class CardFaceImageComponent {
  // TODO: Make sure that it's always passing in the data url and not a blob
  private readonly fileUploadApiService: FileUploadApiService = inject(FileUploadApiService);
  private readonly cardEditorControlsDesignImageService: CardEditorControlsDesignImageService = inject(CardEditorControlsDesignImageService);

  cardFaceImageSrc: InputSignal<string | undefined> = input<string | undefined>('');

  cardFaceImageWidth: InputSignal<number> = input<number>(100);
  cardFaceImageHeight: InputSignal<number> = input<number>(100);

  imageHtmlContentChange: OutputEmitterRef<{
    src: string;
    alt: string;
    width: number;
    height: number;
  }> = output<{
    src: string;
    alt: string;
    width: number;
    height: number;
  }>();

  imageHtmlContent: {
    src: string;
    alt: string;
    width: number;
    height: number;
} = {
    src: '',
    alt: '',
    width: 0,
    height: 0
  };

  draggingAttributes: {
    draggingWindow: boolean;
    draggingCorner: boolean;
    x: number;
    y: number;
    px: number;
    py: number;
    resizer: Function | undefined;
  } = {
    draggingWindow: false,
    draggingCorner: false,
    x: 300,
    y: 100,
    px: 0,
    py: 0,
    resizer: undefined
  }

  setInitialImage() {
    this.imageHtmlContent = {
      src: 'https://www.charitycomms.org.uk/wp-content/uploads/2019/02/placeholder-image-square.jpg',
      alt: 'Placeholder square image',
      width: 100,
      height: 100
    };
  }

  setImageSrc(url: string) {
    this.imageHtmlContent.src = url;

    // TODO: Replace the front portion with the client URL
    // http://localhost:4200/
    let clientUrl: string = 'http:\/\/localhost:4200\/';
    let guidPattern: RegExp = /^(?:\{{0,1}(?:[0-9a-fA-F]){8}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){12}\}{0,1})$/;
    
   //  let newRegex: RegExp = new RegExp(clientUrl + guidPattern);

    // let newRegex: RegExp = /^http:\/\/localhost:4200\/(?:\{{0,1}(?:[0-9a-fA-F]){8}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){12}\}{0,1})$/;

    if (this.imageHtmlContent.src.match(guidPattern))
    {
      this.getImageFromStorage$(this.imageHtmlContent.src).subscribe((image: HTMLImageElement) =>{
        this.imageHtmlContent = {
          src: image.src,
          alt: image.alt,
          width: image.naturalWidth,
          height: image.naturalHeight
        };
      })
    }
  }

  constructor() {
    this.setInitialImage();

    effect(() => {
      if (this.cardFaceImageSrc() !== '' && this.cardFaceImageSrc() !== undefined) {
        this.setImageSrc(this.cardFaceImageSrc() as string);
      }

      if (this.cardFaceImageWidth() > 0) {
        this.imageHtmlContent.width = this.cardFaceImageWidth();
      }

      if (this.cardFaceImageHeight() > 0) {
        this.imageHtmlContent.height = this.cardFaceImageHeight();
      }
    });
  }

  // PURPOSE: Emit back the cardFaceElementID
  showImageEditor: OutputEmitterRef<void> = output<void>();

  // FIXME: Why is this matching twice?
  extractGuid(url: string): string | null {
    // Captures a GUID anywhere in the string (with or without curly braces)
    let guidRegex = /(?:\{{0,1})([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})(?:\}{0,1})/;
    let match = url.match(guidRegex);
    return match ? match[1] : null;
  }
  
  getImageFromStorage$(url: string): Observable<HTMLImageElement> {
    let guid = this.extractGuid(url);

    if (!guid)
      return EMPTY;
    
    return this.fileUploadApiService.getFile(guid, 'card-face-element-image').pipe(
        switchMap((blob: Blob | undefined) => {
          if (blob === undefined)
            return EMPTY;

          return new Observable<HTMLImageElement>((observer: Subscriber<HTMLImageElement>) => {
            let img = new Image();
            let objectUrl: string = URL.createObjectURL(blob);
            img.src = objectUrl;
    
            img.onload = () => {
              observer.next(img);
              observer.complete();
              // URL.revokeObjectURL(objectUrl); // Use the objectUrl, not img.src
            };

            img.onerror = (err) => observer.error(err);
          }
        )
    }));
  }

  onOpenImageEditor(event: Event) {
    this.showImageEditor.emit(); // no payload
  }

  onImageLoad(url: string) {
    if (!url.startsWith('blob:'))
      return;

    URL.revokeObjectURL(url);
    // console.log('Blob URL revoked after image loaded');
  }

  // https://dev.to/zchtodd/creating-a-resizable-draggable-component-in-angular2-9cl
  // TODO: Refactor this functionality into its own component eventually or service?
  bottomRightResize(imageHtmlContent: {
    src: string;
    alt: string;
    width: number;
    height: number;
  }, offsetX: number, offsetY: number) {
    console.log(`Bottom right resize: ${JSON.stringify(imageHtmlContent)}`);
    if (!imageHtmlContent) return;
    
    clamp(imageHtmlContent.width += offsetX, 0.01, 400);
    clamp(imageHtmlContent.height += offsetY, 0.01, 400);
  }

  onCornerClick(event: MouseEvent, resizer?: Function) {
    this.draggingAttributes.draggingCorner = true;
    
    this.draggingAttributes.px = event.clientX;
    this.draggingAttributes.py = event.clientY;
    
    this.draggingAttributes.resizer = resizer;
    
    event.preventDefault();
    event.stopPropagation();
  }

  @HostListener('document:mousemove', ['$event'])
  onCornerMove(event: MouseEvent) {
    if (!this.draggingAttributes.draggingCorner) {
        return;
    }
    let offsetX = event.clientX - this.draggingAttributes.px;
    let offsetY = event.clientY - this.draggingAttributes.py;

    let resizer = this.draggingAttributes.resizer;

    console.log(`Resizer function: ${resizer}`);

    if (resizer) {
      resizer(this.imageHtmlContent, offsetX, offsetY);
    }

    this.draggingAttributes.px = event.clientX;
    this.draggingAttributes.py = event.clientY;
  }

  @HostListener('document:mouseup', ['$event'])
  onCornerRelease(event: MouseEvent) {
    this.draggingAttributes.draggingWindow = false;
    this.draggingAttributes.draggingCorner = false;
  
    this.imageHtmlContentChange.emit(this.imageHtmlContent);
  }
}
