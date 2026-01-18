import { ApplicationRef, ComponentRef, createComponent, DestroyRef, ElementRef, EnvironmentInjector, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, from, map, Observable, of, switchMap, tap } from 'rxjs';
import { FileMetadata, FileMetadataStatus } from '../../../../../../utils/models/file-metadata';
import { FileMetadataService } from '../../../../../../utils/services/file/metadata/facade/file-metadata.service';
import { FileUploadApiService } from '../../../../../../utils/services/file/upload/api/file-upload-api.service';
import { FileUploadService } from '../../../../../../utils/services/file/upload/facade/file-upload.service';
import { clear, flattenToImage, generateResizedImagesAtQualities, setModalStyle, stringify } from '../../../../../../utils/utils';
import { CardEditorCardDto } from '../../../../models/card';
import { CardEditorCardFaceDto, CardFace } from '../../../../models/card-face';
import { DEFAULT_CARD_FACE_THUMBNAILS_VOLUME_PATH } from '../../../../utils/card-face.constants';
import { areAllFileMetadataOfStatus } from '../../../../../../utils/file-metadata.utils';
import { CardEditorFacePreviewComponent } from '../../../../components/card-editor-face-preview/card-editor-face-preview.component';
import { closeModal, openModal } from '../../../../../../utils/modals.utils';
import { DEFAULT_MODAL_STYLE, shouldMakeCardFaceThumbnailLods } from '../../../../utils/card-editor.constants';

@Injectable({
  providedIn: 'root'
})
export class CardFaceLodsService {
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  private readonly fileUploadApiService: FileUploadApiService = inject(FileUploadApiService);

  private readonly fileUploadService: FileUploadService = inject(FileUploadService);

  private readonly fileMetadataService: FileMetadataService = inject(FileMetadataService);

  private readonly environmentInjector: EnvironmentInjector = inject(EnvironmentInjector);
  private readonly appRef: ApplicationRef = inject(ApplicationRef);

  public orphanedFileMetadata: FileMetadata[] = [];

   private instances: Map<
    string, 
    {
      host: HTMLElement,
      ref: ComponentRef<CardEditorFacePreviewComponent>
    }> = new Map();

  constructor() { }

  public clear(): void {
    console.log(`%c${this.constructor.name} - ${this.clear.name}(before):\n${stringify(this.orphanedFileMetadata)}`, 'color: #FFA4A4; background: #FCF9EA; padding: 5px; border-radius: 5px;');

    // CHECKME: Do we actually want this check?
    if (!areAllFileMetadataOfStatus(this.orphanedFileMetadata, FileMetadataStatus.Orphaned)) throw new Error(`${this.constructor.name} - ${this.clear.name}: orphanedFileMetadata should all have orphaned file metadata`);

    clear(this.orphanedFileMetadata);

    console.assert(this.orphanedFileMetadata.length === 0, `${this.constructor.name} - ${this.clear.name}: orphanedFileMetadata isn't cleared`);
    console.log(`%c${this.constructor.name} - ${this.clear.name} (after):\n${stringify(this.orphanedFileMetadata)}`, 'color: #8E7DBE; background: #F4F8D3; padding: 5px; border-radius: 5px;');
  }

  public setCardFaceThumbnailImages$(cardEditorFace: ElementRef, cardEditorCardDto: CardEditorCardDto, cardFaceIndex: number): Observable<string[] | undefined> {
    return from(flattenToImage(cardEditorFace))
      .pipe(
        switchMap((originalThumbnail: FormData) =>
          from(generateResizedImagesAtQualities(originalThumbnail)).
            pipe(
              switchMap((differentQualitiesThumbnails: FormData) =>
                this.createCardFaceThumbnailImages$(cardEditorCardDto, cardFaceIndex, differentQualitiesThumbnails)
                  .pipe(takeUntilDestroyed(this.destroyRef))
              )
            )
        ),
        takeUntilDestroyed(this.destroyRef) // TODO: Pass in the destroyRef as a parameter
      );
  }

  private createCardFaceThumbnailImages$(cardEditorCardDto: CardEditorCardDto, cardFaceIndex: number, cardFaceThumbnailImages: FormData): Observable<string[] | undefined> {
    if (!cardFaceThumbnailImages) {
      return of(undefined);
    }

    return this.fileUploadApiService.uploadFiles$(cardFaceThumbnailImages, 'card-face').pipe(
      switchMap((result: string[] | undefined) => {
        // TODO: Why are the upload files not working
        console.log(`%c${this.constructor.name} - ${this.createCardFaceThumbnailImages$.name} - ${this.fileUploadApiService.uploadFiles$.name}: ${stringify(result)}`, `color: #778873; background: #F1F3E0; padding: 5px; border-radius: 5px;`);
        if (!result || result.length <= 0) return of(undefined);


        // ASSUMPTION: The cardFacePerLods already have elements beforehand, set in the blank card template
        // CHECKME: Would we even need this check
        /*if (!cardFacePerLods)
          throw Error("No LODs associated with card face to add thumbnail images to");*/

        // console.log(`Card face thumbnail LODs before orphaning file metadata: ${JSON.stringify(cardFacePerLods, null, 2)}`);

        // Because files are automatically created, we just want to delay and see whether we'd need to delete those files in the first place
        // As this is before saving or creating
        let fileMetadataLods: FileMetadata[] = cardEditorCardDto.cardEditorCardFacesDto[cardFaceIndex].fileMetadataLods;

        // CHECKME: Would this be fine
        for (let lod of fileMetadataLods) {
          this.orphanedFileMetadata.push(lod);
        }

        // We assume that the file's not used immediately because this is at the stage before creating, saving, etc.
        // When we get to that point, the backend will handle setting creationDate to null
        return this.fileMetadataService.createFilesMetadata$(DEFAULT_CARD_FACE_THUMBNAILS_VOLUME_PATH, result, FileMetadataStatus.Pending).pipe(
          map((filesMetadata: FileMetadata[] | undefined) => {
            if (!filesMetadata) throw new Error(`${this.constructor.name}  - ${this.createCardFaceThumbnailImages$.name} - ${this.fileMetadataService.createFilesMetadata$.name}: Could not generate new file metadata lods`);

            cardEditorCardDto.cardEditorCardFacesDto[cardFaceIndex].fileMetadataLods = filesMetadata;

            return filesMetadata.map((fm: FileMetadata) => {
              return fm.fileName;
            });
          }),
          takeUntilDestroyed(this.destroyRef)
        );
      })
    )
  }

  public duplicateCardFaceThumbnails$(cardEditorCardDto: CardEditorCardDto, destroyRef: DestroyRef): Observable<(FileMetadata[] | undefined)[]> {
    let items: {
      cardFace: CardFace;
      fileMetadataLods: FileMetadata[];
    }[] = cardEditorCardDto.cardEditorCardFacesDto
      .filter(dto => dto.cardFace && dto.fileMetadataLods)
      .map(dto => ({
        cardFace: dto.cardFace,
        fileMetadataLods: dto.fileMetadataLods
      }));

    // Emit an empty array if there are no observables to join to continue onto switch map
    if (items.length <= 0) return of([]);

    let observables$: Observable<FileMetadata[] | undefined>[] = items.map((item: {
      cardFace: CardFace;
      fileMetadataLods: FileMetadata[];
    }) =>
      this.fileUploadService.duplicateFiles$(
        item.fileMetadataLods,
        'card-face',
        DEFAULT_CARD_FACE_THUMBNAILS_VOLUME_PATH
      )
        .pipe(
          tap((lods: FileMetadata[] | undefined) => {
            if (lods) item.fileMetadataLods = lods;
          })
        )
    );

    // Emit an empty array if there are no observables to join to continue onto switch map
    if (observables$.length === 0) {
      return of([]);
    }

    return forkJoin(observables$).pipe(takeUntilDestroyed(destroyRef));
  }

  public orphanFileMetadata(): void {
    this.fileMetadataService.markFileMetadata(this.orphanedFileMetadata, FileMetadataStatus.Orphaned);
  }

  public createCardEditorCardFaceDtoLods$(cardEditorCardDto: CardEditorCardDto, index: number): Observable<string[] | undefined> {
    let value: CardEditorCardFaceDto = cardEditorCardDto.cardEditorCardFacesDto[index];

    if (!shouldMakeCardFaceThumbnailLods(value)) return of(undefined);

    let host: HTMLElement = document.createElement('card-editor-face-preview-host');

    let ref: ComponentRef<CardEditorFacePreviewComponent> = createComponent(CardEditorFacePreviewComponent, {
      environmentInjector: this.environmentInjector,
      hostElement: host,
    });

    // CHECKME: This is temporary and dependent on viewport width and height so it's gonna cause issues
    setModalStyle(host, {
      ...DEFAULT_MODAL_STYLE,
      width: '90vw',
      height: '90vh',
      display: 'block',
      pointerEvents: 'none',
    });

    openModal(this.appRef, { host, ref });

    ref.changeDetectorRef.detectChanges(); // CHECKME: Do we need these?

    console.log(`%c${this.constructor.name} - ${this.createCardEditorCardFaceDtoLods$.name} (time: ${Date.now().toLocaleString("en-US")}) Style:\n${stringify(value.cardFace.style)}\nElements:\n${stringify(value.cardFaceElementsPerCardFace)}`, 'color: #453643; background: #8DAA91; padding: 5px; border-radius: 5px;');

    ref.instance.getCurrentCardFaceStyle(value.cardFace.style);
    ref.instance.setCardFaceElementsPerCardFace(value.cardFaceElementsPerCardFace);

    // FIXME: So why are the images not showing up?

    ref.changeDetectorRef.detectChanges(); // CHECKME: Do we need these?

    console.log(`%c${this.constructor.name} - ${this.createCardEditorCardFaceDtoLods$.name} (time: ${Date.now().toLocaleString("en-US")}) Computed style:\n${stringify(window.getComputedStyle(ref.instance.cardEditorFace.nativeElement))}\nDimensions:\n${stringify(ref.instance.cardEditorFace.nativeElement.getBoundingClientRect())}`, 'color: #ffffff; background: #0066cc; padding: 5px; border-radius: 5px;');

    this.instances.set(crypto.randomUUID(), {host, ref});

    return this.setCardFaceThumbnailImages$(ref.instance.cardEditorFace, cardEditorCardDto, index);
  }

  public clearCardEditorFacePreviewInstances(): void {
    this.instances.forEach((value: {
      host: HTMLElement,
      ref: ComponentRef<CardEditorFacePreviewComponent>
    }) => {
      closeModal(this.appRef, value);
    });

    this.instances.clear();
  }
}
