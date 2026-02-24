import { DestroyRef, ElementRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, from, Observable, of, switchMap, tap } from 'rxjs';
import { areAllFileMetadataOfStatus } from '../../../../../utils/file-metadata.utils';
import { FileMetadata, FileMetadataStatus } from '../../../../../utils/models/file-metadata';
import { FileMetadataService } from '../../../../../utils/services/file/metadata/facade/file-metadata.service';
import { FileUploadApiService } from '../../../../../utils/services/file/upload/api/file-upload-api.service';
import { FileUploadService } from '../../../../../utils/services/file/upload/facade/file-upload.service';
import { clear, flattenToImage, generateResizedImagesAtQualities, logInfo, stringify } from '../../../../../utils/utils';
import { CardEditorCardDto } from '../../../card-editor/models/card-editor-card-dto';
import { DEFAULT_CARD_FACE_THUMBNAILS_VOLUME_PATH } from '../../../card-face/constants/card-face.constants';
import { CardFace } from '../../../card-face/models/card-face';

@Injectable({
  providedIn: 'root'
})
export class CardFaceLodsService {
  private readonly fileUploadApiService: FileUploadApiService = inject<FileUploadApiService>(FileUploadApiService);

  private readonly fileUploadService: FileUploadService = inject<FileUploadService>(FileUploadService);

  private readonly fileMetadataService: FileMetadataService = inject<FileMetadataService>(FileMetadataService);

  public orphanedFileMetadata: FileMetadata[] = [];

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

  public orphanCardFaceLods(fileMetadataLods: FileMetadata[]): void {
    this.orphanedFileMetadata.push(...fileMetadataLods);

    console.log(`%c${logInfo(this.constructor.name, this.orphanCardFaceLods.name)}:\n${stringify(this.orphanedFileMetadata)}`, 'color: #392F5A; background: #9DD9D2; padding: 5px; border-radius: 5px;');
  }
}
