import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, from, map, Observable, of, switchMap, tap } from 'rxjs';
import { FileMetadata, FileMetadataStatus } from '../../../../../../utils/models/file-metadata';
import { FileMetadataService } from '../../../../../../utils/services/file/metadata/facade/file-metadata.service';
import { FileUploadApiService } from '../../../../../../utils/services/file/upload/api/file-upload-api.service';
import { FileUploadService } from '../../../../../../utils/services/file/upload/facade/file-upload.service';
import { blobUrlToDataURL, clear, getImageFormData$, stringify } from '../../../../../../utils/utils';
import { CardEditorCardDto } from '../../../../models/card';
import { CardEditorCardFaceDto } from '../../../../models/card-face';
import { CardFaceElementImage, CardFaceElementPerCardFace } from '../../../../models/card-face-element';
import { DEFAULT_CARD_FACE_ELEMENT_IMAGE_VOLUME_PATH } from '../../../../utils/card-face-element.constants';
import { getCardFaceElementImage, isCardFaceElementImage } from '../../../../utils/card-game-core.utils';
import { CardFaceElementService } from '../card-face-element.service';
import { areAllFileMetadataOfStatus } from '../../../../../../utils/file-metadata.utils';

@Injectable({
  providedIn: 'root'
})
export class CardFaceElementImageService {
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  private readonly fileUploadService: FileUploadService = inject(FileUploadService);

  private readonly fileUploadApiService: FileUploadApiService = inject(FileUploadApiService);

  private readonly fileMetadataService: FileMetadataService = inject(FileMetadataService);

  public orphanedFileMetadata: FileMetadata[] = [];

  // TODO: MOVE SOMEWHERE ELSE
  private readonly PLACEHOLDER_IMAGE_SRC: string = '/card-editor-controls_card-face-elements-list_image-element-icon.svg'; 

  constructor() { }

  // NOTE: This should be called whenever you upload an image
  // Again, returning it here should be fine, we're assignng the card face element content based on the return value anyways
  public createCardFaceElementImage$(cardFaceElementImage: CardFaceElementImage, image: FormData, destroyRef: DestroyRef): Observable<FileMetadata | undefined> {
    let imageFileMetadata: FileMetadata | undefined = cardFaceElementImage.imageFileMetadata;

    if (image !== undefined) {
      return this.fileUploadApiService.uploadFile$(image, 'card-face-element-image').pipe(
        switchMap((result: { id: string | undefined }) => {
          console.log(`%c${this.constructor.name} - ${this.createCardFaceElementImage$.name} - ${this.fileUploadApiService.uploadFile$.name}: ${stringify(result)}`, `color: #31326F; background: #A8FBD3; padding: 5px; border-radius: 5px;`);
          if (!result.id) return of(undefined);

          return this.fileMetadataService.createFileMetadata$(DEFAULT_CARD_FACE_ELEMENT_IMAGE_VOLUME_PATH, result.id, FileMetadataStatus.Pending).pipe(
            map((newFileMetadata: FileMetadata | undefined) => {
              if (newFileMetadata) {
                // Basically assumes that we have a previous file metadata and am overriding it
                // CHECKME: Should this be a shallow copy of imageFileMetadata or no?
                if (imageFileMetadata) this.orphanedFileMetadata.push(imageFileMetadata);

                cardFaceElementImage.imageFileMetadata = newFileMetadata;
                
                console.log(`%c${this.constructor.name} - ${this.createCardFaceElementImage$.name} - ${this.fileMetadataService.createFileMetadata$.name}:\nnewFileMetadata:\n${stringify(newFileMetadata)}\norphanedFileMetadata:\n${stringify(this.orphanedFileMetadata)}`, `color: #313647; background: #FFF8D4; padding: 5px; border-radius: 5px;`);
                
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

    console.assert(shareSameValues, `${this.constructor.name} - ${fn}: old and new imageFileMetadata share same values`);
    console.assert(areRefsIdentical, `${this.constructor.name} - ${fn}: old and new imageFileMetadata share same reference`);

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

  // FIXME: How are we clearing attached files
  public clear(): void {
    console.log(`%c${this.constructor.name} - ${this.clear.name}(before):\n${stringify(this.orphanedFileMetadata)}`, 'color: #555879; background: #F4EBD3; padding: 5px; border-radius: 5px;');

    // CHECKME: Do we want this?
    if (!areAllFileMetadataOfStatus(this.orphanedFileMetadata, FileMetadataStatus.Orphaned)) throw new Error(`${this.constructor.name} - ${this.clear.name}: orphanedFileMetadata should all have orphaned file metadata`);

    clear(this.orphanedFileMetadata);

    console.assert(this.orphanedFileMetadata.length === 0, `${this.constructor.name} - ${this.clear.name}: orphanedFileMetadata isn't cleared`);
    console.log(`%c${this.constructor.name} - ${this.clear.name} (after):\n${stringify(this.orphanedFileMetadata)}`, 'color: #004030; background: #FFF9E5; padding: 5px; border-radius: 5px;');
  }

  public getElement(cardFaceElementId: string, cardFaceElementsPerCardFace: CardFaceElementPerCardFace[], cardFaceElementService: CardFaceElementService): CardFaceElementImage {
    let cardFaceElementPerCardFace: CardFaceElementPerCardFace | undefined = cardFaceElementService.getCardFaceElementPerCardFace(cardFaceElementId, cardFaceElementsPerCardFace, 'Image');

    if (!cardFaceElementPerCardFace) throw new Error("Card face element image: There is no current card face element per card face to set attributes");

    let cardFaceElementImage: CardFaceElementImage | undefined = getCardFaceElementImage(cardFaceElementPerCardFace.cardFaceElement);

    if (!cardFaceElementImage) throw new Error("No card face element image");

    return cardFaceElementImage;
  }

  public isImage(cardFaceElementId: string, cardFaceElementsPerCardFace: CardFaceElementPerCardFace[], cardFaceElementService: CardFaceElementService): boolean {
    let cardFaceElementPerCardFace: CardFaceElementPerCardFace | undefined = cardFaceElementService.getCardFaceElementPerCardFace(cardFaceElementId, cardFaceElementsPerCardFace, 'Rte');

    if (!cardFaceElementPerCardFace) return false;

    let cardFaceElementImage: CardFaceElementImage | undefined = getCardFaceElementImage(cardFaceElementPerCardFace.cardFaceElement);

    if (!cardFaceElementImage) return false;

    return true;
  }

  public getSrc(cardFaceElementId: string, cardFaceElementsPerCardFace: CardFaceElementPerCardFace[], cardFaceElementService: CardFaceElementService): string {
    let cardFaceElementImage: CardFaceElementImage = this.getElement(cardFaceElementId, cardFaceElementsPerCardFace, cardFaceElementService);

    if (!cardFaceElementImage || !cardFaceElementImage.imageFileMetadata || !cardFaceElementImage.imageFileMetadata.fileName) return this.PLACEHOLDER_IMAGE_SRC;

    return cardFaceElementImage.imageFileMetadata.fileName;
  }

  public setSrc(croppedImage: string, element: { cardFaceElementId: string, cardFaceElementsPerCardFace: CardFaceElementPerCardFace[], cardFaceElementService: CardFaceElementService }): void;
  public setSrc(croppedImage: string, cardFaceElementImage: CardFaceElementImage): void;
  public setSrc(croppedImage: string, element: CardFaceElementImage | { cardFaceElementId: string, cardFaceElementsPerCardFace: CardFaceElementPerCardFace[], cardFaceElementService: CardFaceElementService }): void {
    function getCardFaceElementImage(getElement: (cardFaceElementId: string, cardFaceElementsPerCardFace: CardFaceElementPerCardFace[], cardFaceElementService: CardFaceElementService) => CardFaceElementImage): CardFaceElementImage {
      if (isCardFaceElementImage(element)) return element;
      return getElement(element.cardFaceElementId, element.cardFaceElementsPerCardFace, element.cardFaceElementService);
    }

    let cardFaceElementImage: CardFaceElementImage = getCardFaceElementImage(this.getElement);

    // https://stackoverflow.com/questions/51019467/convert-blob-to-image-url-and-use-in-image-src-to-display-image
    if (!cardFaceElementImage) throw new Error("Not a card face element image");

    from(blobUrlToDataURL(croppedImage))
      .pipe(
        switchMap((base64Image) => getImageFormData$(base64Image, this.destroyRef)
        ),
        switchMap((formData: FormData | undefined) => {
          if (!formData)
            throw new Error("No card face element image file to upload");

          return this.createCardFaceElementImage$(
            cardFaceElementImage,
            formData,
            this.destroyRef
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (cardFaceElementImageFileMetadata: FileMetadata | undefined) => {
          if (!cardFaceElementImageFileMetadata || !cardFaceElementImage.imageFileMetadata) throw new Error(`Set card face image element src:\nCard face element image file metadata: ${JSON.stringify(cardFaceElementImageFileMetadata, null, 2)}\nImage file metadata${JSON.stringify(cardFaceElementImage.imageFileMetadata, null, 2)}`);

          cardFaceElementImage.imageFileMetadata = cardFaceElementImageFileMetadata;
        },
        error: (err) => {
          console.error(err);
        }
      });
  }
}