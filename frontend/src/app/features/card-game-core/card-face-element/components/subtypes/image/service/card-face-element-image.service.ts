import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, from, map, Observable, of, Subscriber, switchMap, tap } from 'rxjs';

import { areAllFileMetadataOfStatus } from '../../../../../../../utils/file-metadata.utils';
import { FileMetadata, FileMetadataStatus } from '../../../../../../../utils/models/file-metadata';
import { FileMetadataService } from '../../../../../../../utils/services/file/metadata/facade/file-metadata.service';
import { FileUploadApiService } from '../../../../../../../utils/services/file/upload/api/file-upload-api.service';
import { FileUploadService } from '../../../../../../../utils/services/file/upload/facade/file-upload.service';
import { blobUrlToDataURL, clear, getImageFormData$, logInfo, stringify } from '../../../../../../../utils/utils';
import { CardEditorCardDto } from '../../../../../card-editor/models/card-editor-card-dto';
import { CardEditorCardFaceDto } from '../../../../../card-editor/models/card-editor-card-face-dto';

import { DEFAULT_CARD_FACE_ELEMENT_IMAGE_VOLUME_PATH } from '../../../../../utils/card-face-element.constants';

import { CardFaceElement, CardFaceElementImage, CardFaceElementPerCardFace } from '../../../../models/card-face-element';
import { CardFaceElementService } from '../../../../services/core/card-face-element.service';
import { PLACEHOLDER_IMAGE_SRC } from '../constants/card-face-element-image.constants';

@Injectable({
  providedIn: 'root'
})
export class CardFaceElementImageService extends CardFaceElementService {
  private readonly fileUploadService: FileUploadService = inject<FileUploadService>(FileUploadService);

  private readonly fileUploadApiService: FileUploadApiService = inject<FileUploadApiService>(FileUploadApiService);

  private readonly fileMetadataService: FileMetadataService = inject<FileMetadataService>(FileMetadataService);

  public orphanedFileMetadata: FileMetadata[] = [];

  constructor() {
    super();
  }

  // NOTE: This should be called whenever you upload an image
  // Again, returning it here should be fine, we're assignng the card face element content based on the return value anyways
  public createCardFaceElementImage$(cardFaceElementImage: CardFaceElementImage, image: FormData, destroyRef: DestroyRef): Observable<FileMetadata | undefined> {
    let imageFileMetadata: FileMetadata | undefined = cardFaceElementImage.imageFileMetadata;

    if (image !== undefined) {
      return this.fileUploadApiService.uploadFile$(image, 'card-face-element-image').pipe(
        switchMap((result: { id: string | undefined }) => {
          console.log(`%c${logInfo(this.constructor.name, `${this.createCardFaceElementImage$.name} - ${this.fileUploadApiService.uploadFile$.name}`)}: ${stringify(result)}`, `color: #31326F; background: #A8FBD3; padding: 5px; border-radius: 5px;`);
          if (!result.id) return of(undefined);

          return this.fileMetadataService.createFileMetadata$(DEFAULT_CARD_FACE_ELEMENT_IMAGE_VOLUME_PATH, result.id, FileMetadataStatus.Pending).pipe(
            map((newFileMetadata: FileMetadata | undefined) => {
              if (newFileMetadata) {
                // Basically assumes that we have a previous file metadata and am overriding it
                // CHECKME: Should this be a shallow copy of imageFileMetadata or no?
                if (imageFileMetadata) this.orphanedFileMetadata.push(imageFileMetadata);

                cardFaceElementImage.imageFileMetadata = newFileMetadata;

                console.log(`%c${logInfo(this.constructor.name, `${this.createCardFaceElementImage$.name} - ${this.fileMetadataService.createFileMetadata$.name}`)}:\nnewFileMetadata:\n${stringify(newFileMetadata)}\norphanedFileMetadata:\n${stringify(this.orphanedFileMetadata)}`, `color: #313647; background: #FFF8D4; padding: 5px; border-radius: 5px;`);

                return newFileMetadata;
              }

              return undefined;
            })
          );
        }),
        takeUntilDestroyed(destroyRef)
      );
    }

    return of(undefined);
  }

  private assertCardFaceElementImages(fn: string, a: FileMetadata, b: FileMetadata): boolean {
    let shareSameValues: boolean = stringify(a) !== stringify(b), areRefsIdentical: boolean = a !== b;

    console.assert(shareSameValues, `${logInfo(this.constructor.name, fn)}: old and new imageFileMetadata share same values`);
    console.assert(areRefsIdentical, `${logInfo(this.constructor.name, fn)}: old and new imageFileMetadata share same reference`);

    return shareSameValues && areRefsIdentical;
  }

  // CHECKME: Either figure out how to unit test or do console logging
  public duplicateCardFaceElementImages$(cardEditorCardDto: CardEditorCardDto, destroyRef: DestroyRef): Observable<void> {
    let observables$: Array<Observable<FileMetadata | undefined>> = [];
    let elements: CardFaceElementPerCardFace[] = [];
    let guidPattern: RegExp = /^(?:\{{0,1}(?:[0-9a-fA-F]){8}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){12}\}{0,1})$/; // TODO: MAKE THIS A CONSTANT, PLEASE

    cardEditorCardDto.cardEditorCardFacesDto.forEach((cardEditorCardFaceDto: CardEditorCardFaceDto) => {
      cardEditorCardFaceDto.cardFaceElementsPerCardFace
        .filter(cardFaceElementPerCardFace =>
          cardFaceElementPerCardFace.cardFaceElement.cardFaceElementType === "Image" && cardFaceElementPerCardFace.cardFaceElement.cardFaceElementId.match(/^\d{17,19}$/)           // NOTE: This means that the card face image element hasn't actually been created yet and therefore doesn't have a Snowflake ID, there's no point of duplicating
        )
        .forEach((cardFaceElementPerCardFace: CardFaceElementPerCardFace) => {
          let cardFaceElementImage: CardFaceElementImage = cardFaceElementPerCardFace.cardFaceElement as CardFaceElementImage;

          // FIXED: Checking for undefined doesn't check for null. Couldn't add a card to room with nonexistent card face element image null file metadata
          // NOTE: Just checks to make sure that the file name actually matches teh pattern else you're going to get nothing back anyways
          if (!cardFaceElementImage.imageFileMetadata || !cardFaceElementImage.imageFileMetadata.fileName.match(guidPattern)) return;

          observables$.push(
            this.fileUploadService.duplicateFile$(
              cardFaceElementImage.imageFileMetadata,
              'card-face-element-image',
              DEFAULT_CARD_FACE_ELEMENT_IMAGE_VOLUME_PATH
            )
              .pipe(
                tap((fm: FileMetadata | undefined) => {
                  if (!fm || !cardFaceElementImage.imageFileMetadata) throw new Error();

                  this.assertCardFaceElementImages(this.duplicateCardFaceElementImages$.name, cardFaceElementImage.imageFileMetadata, fm);
                  cardFaceElementImage.imageFileMetadata = fm;
                }),
                takeUntilDestroyed(destroyRef)
              )
          );

          elements.push(cardFaceElementPerCardFace);
        });
    });

    if (observables$.length <= 0) return of(undefined); // Ensures emission if nothing to duplicate

    return forkJoin(observables$).pipe(
      map(() => void 0),
      takeUntilDestroyed(destroyRef)
    );
  }

  public orphanFileMetadata(): void {
    this.fileMetadataService.markFileMetadata(this.orphanedFileMetadata, FileMetadataStatus.Orphaned);
  }

  // CHECKME: Is overriding the super clear function fine?
  public override clear(): void {
    console.log(`%c${logInfo(this.constructor.name, this.clear.name)}(before):\n${stringify(this.orphanedFileMetadata)}`, 'color: #555879; background: #F4EBD3; padding: 5px; border-radius: 5px;');

    // CHECKME: Do we want this?
    if (!areAllFileMetadataOfStatus(this.orphanedFileMetadata, FileMetadataStatus.Orphaned)) throw new Error(`${this.constructor.name} - ${this.clear.name}: orphanedFileMetadata should all have orphaned file metadata`);

    clear(this.orphanedFileMetadata);

    console.assert(this.orphanedFileMetadata.length === 0, `${logInfo(this.constructor.name, this.clear.name)}: orphanedFileMetadata isn't cleared`);
    console.log(`%c${logInfo(this.constructor.name, this.clear.name)} (after):\n${stringify(this.orphanedFileMetadata)}`, 'color: #004030; background: #FFF9E5; padding: 5px; border-radius: 5px;');
  }

  // TODO: Make this more robust or rename it to something clearer
  public getElements(cardFaceElementsPerCardFace: CardFaceElementPerCardFace[]): CardFaceElementPerCardFace[] {
    return cardFaceElementsPerCardFace.filter((cardFaceElementPerCardFace: CardFaceElementPerCardFace) => cardFaceElementPerCardFace.cardFaceElement.cardFaceElementType === 'Image');
  }

  public getElement(cardFaceElementId: string, cardFaceElementsPerCardFace: CardFaceElementPerCardFace[]): CardFaceElementImage {
    let cardFaceElementPerCardFace: CardFaceElementPerCardFace | undefined = this.getCardFaceElementPerCardFace(cardFaceElementId, cardFaceElementsPerCardFace, 'Image');

    if (!cardFaceElementPerCardFace) throw new Error("Card face element image: There is no current card face element per card face to set attributes");

    let cardFaceElementImage: CardFaceElementImage | undefined = this.getCardFaceElementImage(cardFaceElementPerCardFace.cardFaceElement);

    if (!cardFaceElementImage) throw new Error("No card face element image");

    return cardFaceElementImage;
  }

  public getCardFaceElementImage(cardFaceElement: CardFaceElement): CardFaceElementImage | undefined {
    if (cardFaceElement.cardFaceElementType !== "Image")
      return;

    return (cardFaceElement as CardFaceElementImage);
  }

  public isImage(cardFaceElementId: string, cardFaceElementsPerCardFace: CardFaceElementPerCardFace[]): boolean {
    let cardFaceElementPerCardFace: CardFaceElementPerCardFace | undefined = this.getCardFaceElementPerCardFace(cardFaceElementId, cardFaceElementsPerCardFace, 'Image');

    if (!cardFaceElementPerCardFace) return false;

    let cardFaceElementImage: CardFaceElementImage | undefined = this.getCardFaceElementImage(cardFaceElementPerCardFace.cardFaceElement);

    if (!cardFaceElementImage) return false;

    return true;
  }

  public getSrc(cardFaceElementId: string, cardFaceElementsPerCardFace: CardFaceElementPerCardFace[]): string {
    let cardFaceElementImage: CardFaceElementImage = this.getElement(cardFaceElementId, cardFaceElementsPerCardFace);

    if (!cardFaceElementImage || !cardFaceElementImage.imageFileMetadata || !cardFaceElementImage.imageFileMetadata.fileName) return PLACEHOLDER_IMAGE_SRC;

    return cardFaceElementImage.imageFileMetadata.fileName;
  }

  public setSrc$(croppedImage: string, cardFaceElementImage: CardFaceElementImage, destroyRef: DestroyRef): Observable<FileMetadata | undefined> {
    // https://stackoverflow.com/questions/51019467/convert-blob-to-image-url-and-use-in-image-src-to-display-image
    if (!cardFaceElementImage) throw new Error("Not a card face element image");

    // FIXME: Why does it never go into the switchmap
    return from(
        blobUrlToDataURL(croppedImage)
      )
      .pipe(
        switchMap((base64Image: string) => getImageFormData$(base64Image, destroyRef)),
        switchMap((formData: FormData) => {
          if (!formData) throw new Error("No card face element image file to upload");
          return this.createCardFaceElementImage$(cardFaceElementImage, formData, destroyRef);
        }),
        takeUntilDestroyed(destroyRef)
      )
  }

  // CHECKME: Put this somewhere else? Make it utility based
  private extractGuid(url: string): string | null {
    // Captures a GUID anywhere in the string (with or without curly braces)
    let guidRegex: RegExp = /(?:\{{0,1})([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})(?:\}{0,1})/;
    let match: RegExpMatchArray | null = url.match(guidRegex);
    return match ? match[1] : null;
  }

  public getImage$(url: string): Observable<HTMLImageElement | undefined> {
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

  public onRevokeSrc(url: string): void {
    if (!url.startsWith('blob:')) return;

    URL.revokeObjectURL(url);
    // console.log('Blob URL revoked after image loaded');
  }

  public setImageSrc$(url: string, destroyRef: DestroyRef): Observable<HTMLImageElement | undefined> {
    console.log(`%c${logInfo(this.constructor.name, this.setImageSrc$.name)} - url:\n${url}`, 'color: #4b2142; background: #97ead2; padding: 5px; border-radius: 5px;');

    let guidPattern: RegExp = /^(?:\{{0,1}(?:[0-9a-fA-F]){8}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){12}\}{0,1})$/;

    if (!url.match(guidPattern)) return of(undefined);

    return this.getImage$(url)
      .pipe(
        map((image: HTMLImageElement | undefined) => {
          console.log(`%c${logInfo(this.constructor.name, this.setImageSrc$.name)} - image: ${stringify(image)}`, 'color: #004c63; background: #d4fdfd; padding: 5px; border-radius: 5px;');

          return image;
        }),
        takeUntilDestroyed(destroyRef)
      )
  }

  public getAllImageSrcs$(cardFaceElementsPerCardFace: CardFaceElementPerCardFace[], destroyRef: DestroyRef): Observable<{
    cardFaceElementId: string;
    htmlImageElementSrc: string;
  }[]> {
    if (!cardFaceElementsPerCardFace?.length) return of([]);
    
    let obs$: Observable<{
      cardFaceElementId: string,
      htmlImageElementSrc: string
    }>[] = cardFaceElementsPerCardFace.map((value: CardFaceElementPerCardFace) =>
      this.setImageSrc$(
        this.getSrc(value.cardFaceElement.cardFaceElementId, cardFaceElementsPerCardFace), destroyRef)
        .pipe(
          map((img: HTMLImageElement | undefined) => ({
            cardFaceElementId: value.cardFaceElement.cardFaceElementId,
            htmlImageElementSrc: img?.src ?? PLACEHOLDER_IMAGE_SRC
          }))
        )
    );

    return forkJoin(obs$);
  }

  public setCardFaceImages(cardFaceElementsPerCardFace: CardFaceElementPerCardFace[], cardFaceElementImages: Map<string, string>, cardFaceElementService: CardFaceElementService, destroyRef: DestroyRef): void {
    console.log(`%c${logInfo(this.constructor.name, this.setCardFaceImages.name)} - ${stringify(cardFaceElementsPerCardFace)}`, 'color: #C455A8; background: #E5CDC8; padding: 5px; border-radius: 5px;');
    
    if (!cardFaceElementsPerCardFace.length) {
      cardFaceElementImages.clear();
      return;
    }

    // TODO Figure out how to unsubscribe from this
    this.getAllImageSrcs$(cardFaceElementsPerCardFace, destroyRef)
    .pipe(
      takeUntilDestroyed(destroyRef)
    )
    .subscribe((results: {
      cardFaceElementId: string;
      htmlImageElementSrc: string;
    }[]) => {
      results.forEach((result: {
        cardFaceElementId: string;
        htmlImageElementSrc: string;
      }) => {
        let { cardFaceElementId, htmlImageElementSrc } = result;

        cardFaceElementImages.set(cardFaceElementId, htmlImageElementSrc);
      })
    });
  }
}