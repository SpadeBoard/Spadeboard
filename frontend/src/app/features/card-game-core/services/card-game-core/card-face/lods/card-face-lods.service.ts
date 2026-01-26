import { ApplicationRef, ComponentRef, createComponent, DestroyRef, ElementRef, EnvironmentInjector, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, from, Observable, of, Subscription, switchMap, take, tap } from 'rxjs';
import { areAllFileMetadataOfStatus } from '../../../../../../utils/file-metadata.utils';
import { closeModal, openModal } from '../../../../../../utils/modals.utils';
import { FileMetadata, FileMetadataStatus } from '../../../../../../utils/models/file-metadata';
import { FileMetadataService } from '../../../../../../utils/services/file/metadata/facade/file-metadata.service';
import { FileUploadApiService } from '../../../../../../utils/services/file/upload/api/file-upload-api.service';
import { FileUploadService } from '../../../../../../utils/services/file/upload/facade/file-upload.service';
import { clear, flattenToImage, generateResizedImagesAtQualities, logInfo, setModalStyle, stringify } from '../../../../../../utils/utils';
import { CardEditorFacePreviewComponent } from '../../../../components/card-editor-face-preview/card-editor-face-preview.component';
import { CardEditorCardDto } from '../../../../models/card';
import { CardEditorCardFaceDto, CardFace } from '../../../../models/card-face';
import { DEFAULT_MODAL_STYLE, shouldMakeCardFaceThumbnailLods } from '../../../../utils/card-editor.constants';
import { DEFAULT_CARD_FACE_THUMBNAILS_VOLUME_PATH } from '../../../../utils/card-face.constants';
import { CardFaceEditorPreviewElementsService } from '../preview/elements/card-face-editor-preview-elements.service';

@Injectable({
  providedIn: 'root'
})
export class CardFaceLodsService {
  private readonly cardFaceEditorPreviewElementsService: CardFaceEditorPreviewElementsService = inject(CardFaceEditorPreviewElementsService);
  
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
    console.log(`%c${logInfo(this.constructor.name, this.clear.name)}(before):\n${stringify(this.orphanedFileMetadata)}`, 'color: #FFA4A4; background: #FCF9EA; padding: 5px; border-radius: 5px;');

    // CHECKME: Do we actually want this check?
    if (!areAllFileMetadataOfStatus(this.orphanedFileMetadata, FileMetadataStatus.Orphaned)) throw new Error(`${logInfo(this.constructor.name, this.clear.name)}: orphanedFileMetadata should all have orphaned file metadata`);

    clear(this.orphanedFileMetadata);

    console.assert(this.orphanedFileMetadata.length === 0, `${logInfo(this.constructor.name, this.clear.name)}: orphanedFileMetadata isn't cleared`);
    console.log(`%c${logInfo(this.constructor.name, this.clear.name)} (after):\n${stringify(this.orphanedFileMetadata)}`, 'color: #8E7DBE; background: #F4F8D3; padding: 5px; border-radius: 5px;');
  }

  public setCardFaceThumbnailImages$(cardEditorFace: ElementRef, destroyRef: DestroyRef, fileMetadataStatus: FileMetadataStatus = FileMetadataStatus.Pending): Observable<FileMetadata[] | undefined> {
    return from(flattenToImage(cardEditorFace))
      .pipe(
        switchMap((originalThumbnail: FormData) =>
          from(generateResizedImagesAtQualities(originalThumbnail)).
            pipe(
              switchMap((differentQualitiesThumbnails: FormData) =>
                this.createCardFaceThumbnailImages$(differentQualitiesThumbnails, destroyRef, fileMetadataStatus)
                  .pipe(takeUntilDestroyed(destroyRef))
              )
            )
        ),
        takeUntilDestroyed(destroyRef) // TODO: Pass in the destroyRef as a parameter
      );
  }

  private createCardFaceThumbnailImages$(cardFaceThumbnailImages: FormData, destroyRef: DestroyRef, fileMetadataStatus: FileMetadataStatus = FileMetadataStatus.Pending): Observable<FileMetadata[] | undefined> {
    if (!cardFaceThumbnailImages) {
      return of(undefined);
    }

    return this.fileUploadApiService.uploadFiles$(cardFaceThumbnailImages, 'card-face').pipe(
      switchMap((result: string[] | undefined) => {
        // TODO: Why are the upload files not working
        console.log(`%c${logInfo(this.constructor.name, this.createCardFaceThumbnailImages$.name)} - ${this.fileUploadApiService.uploadFiles$.name}: ${stringify(result)}`, `color: #778873; background: #F1F3E0; padding: 5px; border-radius: 5px;`);
        if (!result || result.length <= 0) return of(undefined);

        // ASSUMPTION: The cardFacePerLods already have elements beforehand, set in the blank card template
      
        // We assume that the file's not used immediately because this is at the stage before creating, saving, etc.
        // When we get to that point, the backend will handle setting creationDate to null
        return this.fileMetadataService.createFilesMetadata$(DEFAULT_CARD_FACE_THUMBNAILS_VOLUME_PATH, result, fileMetadataStatus).pipe(
          takeUntilDestroyed(destroyRef)
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

  // FIXME: There's something off with the timing here.
  // The setting images for card face element and styling for the card face occurs way later after the LODs themselves have been set
  // We might need to chain inner observables in here and not just return the creation of the LODs
  public createCardEditorCardFaceDtoLods$(value: CardEditorCardFaceDto, destroyRef: DestroyRef, fileMetadataStatus: FileMetadataStatus = FileMetadataStatus.Pending): Observable<FileMetadata[] | undefined> {
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

    console.log(`%c${logInfo(this.constructor.name, this.createCardEditorCardFaceDtoLods$.name)} Style:\n${stringify(value.cardFace.style)}\nElements:\n${stringify(value.cardFaceElementsPerCardFace)}`, 'color: #453643; background: #8DAA91; padding: 5px; border-radius: 5px;');

    ref.instance.setCurrentCardFaceStyle(value.cardFace.style);
    ref.instance.setCardFaceElementsPerCardFace(value.cardFaceElementsPerCardFace);

    let id: string = crypto.randomUUID();
    this.instances.set(id, { host, ref });

    ref.changeDetectorRef.detectChanges();  // CHECKME: Do we need these?

    return this.setCardFaceThumbnailImages$(ref.instance.cardEditorFace, destroyRef, fileMetadataStatus);
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

  public orphanCardFaceLods(fileMetadataLods: FileMetadata[]): void {
    this.orphanedFileMetadata.push(...fileMetadataLods);

    console.log(`%c${logInfo(this.constructor.name, this.orphanCardFaceLods.name)}:\n${stringify(this.orphanedFileMetadata)}`, 'color: #392F5A; background: #9DD9D2; padding: 5px; border-radius: 5px;');
  }
}
