import { Component, computed, effect, inject, input, InputSignal, output, OutputEmitterRef, Signal } from '@angular/core';
import { FileUploadApiService } from '../../../../utils/services/file-upload-api.service';
import { EMPTY, Observable, Subscriber, switchMap } from 'rxjs';

@Component({
  selector: 'app-card-face-image',
  imports: [],
  templateUrl: './card-face-image.component.html',
  styleUrl: './card-face-image.component.css'
})
export class CardFaceImageComponent {
  // TODO: Make sure that it's always passing in the data url and not a blob
  private readonly fileUploadApiService: FileUploadApiService = inject(FileUploadApiService);

  cardFaceImageSrc: InputSignal<string | undefined> = input<string | undefined>('');
  cardFaceElementId: InputSignal<number> = input<number>(-1);

  imageHTMLContent = {
    src: '',
    alt: '',
    width: 0,
    height: 0
  };

  setInitialImage() {
    this.imageHTMLContent = new Image(100, 100);
    this.imageHTMLContent.src = 'https://www.charitycomms.org.uk/wp-content/uploads/2019/02/placeholder-image-square.jpg',
    this.imageHTMLContent.alt = 'Placeholder square image';
  }

  setImageSrc(url: string) {
    this.imageHTMLContent.src = url;

    // TODO: Replace the front portion with the client URL
    // http://localhost:4200/
    /*let clientUrl: string = 'http:\/\/localhost:4200\/';
    let guidPattern: RegExp = /^(?:\{{0,1}(?:[0-9a-fA-F]){8}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){12}\}{0,1})$/;
    
    let newRegex: RegExp = new RegExp(clientUrl + guidPattern);*/

    let newRegex: RegExp = /^http:\/\/localhost:4200\/(?:\{{0,1}(?:[0-9a-fA-F]){8}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){12}\}{0,1})$/;

    if (this.imageHTMLContent.src.match(newRegex))
    {
      this.getImageFromStorage$(this.imageHTMLContent.src).subscribe((image: HTMLImageElement) =>{
        this.imageHTMLContent = {
          src: image.src,
          alt: image.alt,
          width: 100,
          height: 100
          // FIXME: Temporary, really it should be based on whatever you set as the image's size
          // width: image.naturalWidth,
          // height: image.naturalHeight
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
    });
  }

  // PURPOSE: Emit back the cardFaceElementID
  showImageEditor: OutputEmitterRef<number> = output<number>();
  isOpeningImageEditor: boolean = false;

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
    let cardFaceElementId: number | undefined = this.cardFaceElementId();

    console.log(`Card face image component - Card face element ID: ${cardFaceElementId}`);

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
