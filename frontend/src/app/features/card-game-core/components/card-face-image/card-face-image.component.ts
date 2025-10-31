import { Component, DestroyRef, effect, inject, input, InputSignal, output, OutputEmitterRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, of, Subscriber, switchMap } from 'rxjs';
import { FileUploadApiService } from '../../../../utils/services/file/upload/api/file-upload-api.service';
import { CardFaceImage } from '../../utils/card-face.utils';
import { getDefaultCardFaceElementImage } from '../../utils/card-editor.constants';

@Component({
  selector: 'app-card-face-image',
  imports: [],
  templateUrl: './card-face-image.component.html',
  styleUrl: './card-face-image.component.scss'
})
export class CardFaceImageComponent {
  // TODO: Make sure that it's always passing in the data url and not a blob
  private readonly fileUploadApiService: FileUploadApiService = inject(FileUploadApiService);

  public cardFaceImageSrc: InputSignal<string | undefined> = input<string | undefined>('');

  public cardFaceImageWidth: InputSignal<number> = input<number>(100);
  public cardFaceImageHeight: InputSignal<number> = input<number>(100);

  // TODO: Have this be a function to assign
  protected imageHtmlContent: CardFaceImage = getDefaultCardFaceElementImage();
 
  private previousImageUrl: string = "";
  
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  private setImageSrc(url: string): void {
    this.previousImageUrl = url; // For the comparison above, we don't want to reset the image constantly based on effect, make sure the new url's actually different
    
    // So there's two steps, here the source is already a blob, we revoke it then assign it to the new url
    this.onRevokeSrc(this.imageHtmlContent.src);
    this.imageHtmlContent.src = url;

    let guidPattern: RegExp = /^(?:\{{0,1}(?:[0-9a-fA-F]){8}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){12}\}{0,1})$/;

    if (this.imageHtmlContent.src.match(guidPattern))
    {
      this.getImageFromStorage$(this.imageHtmlContent.src)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((image: HTMLImageElement | undefined) =>{
          if (!image)
            return;

        this.imageHtmlContent.src = image.src;
        this.imageHtmlContent.alt = image.alt;
      })
    }
  }

  constructor() {
    effect(() => {
      if (this.cardFaceImageSrc() !== '' && this.cardFaceImageSrc() !== undefined && this.cardFaceImageSrc() !== this.previousImageUrl) {
        this.setImageSrc(this.cardFaceImageSrc() as string);
      }

      if (this.cardFaceImageWidth() > 0) {
        this.imageHtmlContent.dimensions.width = this.cardFaceImageWidth();
        // console.log(`Card face image width change: ${this.imageHtmlContent.width}`);
      }

      if (this.cardFaceImageHeight() > 0) {
        this.imageHtmlContent.dimensions.height = this.cardFaceImageHeight();
        // console.log(`Card face image height change: ${this.imageHtmlContent.height}`);
      }
    });
  }

  // PURPOSE: Emit back the cardFaceElementID
  public showImageEditor: OutputEmitterRef<void> = output<void>();

  private extractGuid(url: string): string | null {
    // Captures a GUID anywhere in the string (with or without curly braces)
    let guidRegex: RegExp = /(?:\{{0,1})([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})(?:\}{0,1})/;
    let match: RegExpMatchArray | null = url.match(guidRegex);
    return match ? match[1] : null;
  }
  
  getImageFromStorage$(url: string): Observable<HTMLImageElement | undefined> {
    let guid: string | null = this.extractGuid(url);

    if (!guid) return of(undefined);

    return this.fileUploadApiService.getFile$(guid, 'card-face-element-image').pipe(
      switchMap((blob: Blob | undefined) => {
        if (!blob) return of(undefined);

        return new Observable<HTMLImageElement>((observer: Subscriber<HTMLImageElement>) => {
          let img: HTMLImageElement = new Image();
          let objectUrl: string = URL.createObjectURL(blob);
          img.src = objectUrl;

          img.onload = () => {
            observer.next(img);
            observer.complete();
            // URL.revokeObjectURL(objectUrl); // Optionally revoke here
          };

          img.onerror = (err) => observer.error(err);
        });
      })
    );
  }


  onOpenImageEditor(event: Event) {
    this.showImageEditor.emit(); // no payload
  }

  onRevokeSrc(url: string) {
    if (!url.startsWith('blob:'))
      return;

    URL.revokeObjectURL(url);
    // console.log('Blob URL revoked after image loaded');
  }

  ngOnDestroy() {
    // Image not loading on flipped card, problem is it's being destroyed as the card's being flipped, so it's not present in the DOM to be taken images of
    // TODO: Actually call the revoke source somehow
    // This is literally just a workaround and not gonna work
    setTimeout(() => {
      this.onRevokeSrc(this.imageHtmlContent.src);
    }, 1000);
  }
}
