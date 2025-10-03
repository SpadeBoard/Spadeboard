import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, forkJoin, from, iif, map, Observable, of, Subject, switchMap, tap, throwError } from 'rxjs';
import { FileMetadata, FileMetadataStatus } from '../../../utils/models/file-metadata';
import { FileMetadataApiService } from '../../../utils/services/file-metadata-api.service';
import { FileUploadApiService } from '../../../utils/services/file-upload-api.service';
import { DndPosition } from '../../drag-and-drop/models/dnd-types';
import { Style } from '../../style/models/style';
import { Tag } from '../../tagging-system/models/tag';
import { CardEditorCardDto } from '../models/card';
import { CardEditorCardFaceDto, CardFace } from '../models/card-face';
import { CardFaceElementImage, CardFaceElementPerCardFace } from '../models/card-face-element';
import { DEFAULT_CARD_EDITOR_FACE_STYLE, getBlankCardTemplate } from '../utils/card-editor.constants';
import { isCardEditorCardDto } from '../utils/card-game-core.utils';
import { CardEditorCardDtoApiService } from './card-game-core/api/card-editor-card-dto-api.service';
import { CardFaceElementApiService } from './card-game-core/api/card-face-element-api.service';
import { TagsPerCardApiService } from './card-game-core/api/tags-per-card-api.service';
import { getDefaultCardFace } from '../utils/card-face.constants';
import { createFileMetadata$, createFilesMetadata$, duplicateFile$, duplicateFiles$ } from '../../../utils/utils';

@Injectable({
  providedIn: 'root'
})
export class CardEditorPreviewService {
  private readonly cardEditorCardDtoApiService: CardEditorCardDtoApiService = inject(CardEditorCardDtoApiService);
  private readonly fileUploadApiService = inject(FileUploadApiService);
  private readonly cardFaceElementApiService: CardFaceElementApiService = inject(CardFaceElementApiService);
  private readonly tagsPerCardApiService: TagsPerCardApiService = inject(TagsPerCardApiService);

  private destroyRef: DestroyRef = inject(DestroyRef);

  // FIXME: Reset this everytime you open the card editor via the button on the side
  cardEditorCardDto: CardEditorCardDto = getBlankCardTemplate(DEFAULT_CARD_EDITOR_FACE_STYLE, '5811e387-1551-4090-9485-a3ebe30efb5a');

  currentCardEditorCardFaceDto: CardEditorCardFaceDto = {
    cardFace: getDefaultCardFace(),
    cardFaceElementsPerCardFace: [],
    fileMetadataLods: []
  };

  cardFaceImages: FormData[] = [];

  private orphanedFileMetadata: FileMetadata[] = [];

  cardFaceElementsPerCardFaceToDeleteIds: string[] = [];

  tagNamesToDelete: string[] = [];

  private onFlip$$: Subject<void> = new Subject<void>();
  onFlip$: Observable<void> = this.onFlip$$.asObservable();

   private postFlip$$: Subject<void> = new Subject<void>();
  postFlip$: Observable<void> = this.postFlip$$.asObservable();

  private onCreateCardEditorCardDto$$ = new Subject<CardEditorCardDto>();
  onCreateCardEditorCardDto$: Observable<CardEditorCardDto> = this.onCreateCardEditorCardDto$$.asObservable();

  private onUpdateCardEditorCardDto$$ = new Subject<CardEditorCardDto>();
  onUpdateCardEditorCardDto$: Observable<CardEditorCardDto> = this.onUpdateCardEditorCardDto$$.asObservable();

  private onDeleteCardEditorCardDto$$: Subject<string> = new Subject<string>();
  onDeleteCardEditorCardDto$: Observable<string> = this.onDeleteCardEditorCardDto$$.asObservable();

  private onDeleteCardFaceElementPerCardFace$$: Subject<void> = new Subject<void>();
  onDeleteCardFaceElementPerCardFace$: Observable<void> = this.onDeleteCardFaceElementPerCardFace$$.asObservable();

  private onCreateCardFaceElementPerCardFace$$: Subject<{type: string, dndPosition: DndPosition}> = new Subject<{type: string, dndPosition: DndPosition}>();
  onCreateCardFaceElementPerCardFace$: Observable<{type: string, dndPosition: DndPosition}> = this.onCreateCardFaceElementPerCardFace$$.asObservable();

  private onSetCardEditorCardDtoByCardId$$: Subject<void> = new Subject<void>();
  onSetCardEditorCardDtoByCardId$: Observable<void> = this.onSetCardEditorCardDtoByCardId$$.asObservable();
  
  private readonly fileMetadataApiService: FileMetadataApiService = inject(FileMetadataApiService);

  // NOTE: For when clicking on a blank card template
  setBlankCardTemplate() {
    this.cardEditorCardDto = getBlankCardTemplate(DEFAULT_CARD_EDITOR_FACE_STYLE, '5811e387-1551-4090-9485-a3ebe30efb5a');
  }

  setCardEditorCardDtoByCardId(cardId: string) {
    // CHECKME:
    // Prevents accidentally orphaning file metadata we stored for a previous card but never did anything with it
    // Also does that with other stuff like tags as well, we don't want to add tags to an uncreated card or accidentally transfer them
    this.clearItemsToBeDeleted();

    if (parseFloat(cardId) <= 0) {
      this.setBlankCardTemplate() ;

      this.reloadCurrentCardEditorCardFaceDto();
      this.setOnSetCardEditorCardDtoByCardId();
      return;
    }

    // To keep the information that we had, including the orphaned file metadata
    // Actually this is probably unnecessary because the default state is pending, so either way, unless we're creating/saving, it will never be attached
    /*if (this.cardEditorCardDto.card.cardId === cardId)
      return;*/

    this.cardEditorCardDtoApiService.getCardEditorCardDtoByCardId$(cardId)
    .pipe(
      takeUntilDestroyed(this.destroyRef)
    )
    .subscribe(cardEditorCardDto => this.handleCardEditorCardDto(cardEditorCardDto));
  }

  getCardEditorCardDtoByCardId(cardId: string) {
     this.cardEditorCardDtoApiService.getCardEditorCardDtoByCardId$(cardId)
     .pipe(
      takeUntilDestroyed(this.destroyRef)
    )
    .subscribe(cardEditorCardDto => this.handleCardEditorCardDto(cardEditorCardDto));
  }

  private handleCardEditorCardDto(cardEditorCardDto: CardEditorCardDto | undefined) {
    if (cardEditorCardDto) {
      this.cardEditorCardDto = cardEditorCardDto;

      this.reloadCurrentCardEditorCardFaceDto();
      this.setOnSetCardEditorCardDtoByCardId();
    }
  }

  setOnSetCardEditorCardDtoByCardId() {
    this.onSetCardEditorCardDtoByCardId$$.next();
  }

  setCardName(value: string) {
    this.cardEditorCardDto.card.cardName = value;
  }

  getCardName(): string {
    return this.cardEditorCardDto.card.cardName;
  }

  getCurrentCardFaceElementsPerCardFaceAmt(): number {
    return this.currentCardEditorCardFaceDto.cardFaceElementsPerCardFace.length;
  }

  getCurrentCardFaceElementsPerCardFace(): CardFaceElementPerCardFace[] {
    return this.currentCardEditorCardFaceDto.cardFaceElementsPerCardFace;
  }

  setCurrentCardFaceElementsPerCardFace(currentCardFaceElementsPerCardFace: CardFaceElementPerCardFace[]) {
    this.currentCardEditorCardFaceDto.cardFaceElementsPerCardFace = currentCardFaceElementsPerCardFace;
  }

  deleteCardFaceElementPerCardFace(cardFaceElementPerCardFaceId: string) {
    if (!this.isNewCardEditorCardDto() && this.doesCardFaceElementPerCardFaceToDeleteExistInDatabase(cardFaceElementPerCardFaceId)) {
      this.cardFaceElementsPerCardFaceToDeleteIds.push(cardFaceElementPerCardFaceId);

      console.log(`Delete card face element per card face: ${this.cardFaceElementsPerCardFaceToDeleteIds}`);
    }

    this.currentCardEditorCardFaceDto.cardFaceElementsPerCardFace = this.currentCardEditorCardFaceDto.cardFaceElementsPerCardFace.filter(c => c.cardFaceElementPerCardFaceId !== cardFaceElementPerCardFaceId);
    this.onDeleteCardFaceElementPerCardFace$$.next();
  }

  // TODO: Refactor this, rewrite it, it should be more obust than this
  doesCardFaceElementPerCardFaceToDeleteExistInDatabase(cardFaceElementPerCardFaceId: string): boolean {
    return /^\d{17,20}$/.test(cardFaceElementPerCardFaceId);
  }

  // TODO: Refactor, just make one call to the backend and pass in all those IDs
  // With the clearItemsToBeDeleted for the updateCardPostApiOperation, there won't be risk of leftover cardFaceElementsPerCardFaceToDeleteIds
  private deleteSavedCardFaceElementsPerCardFace$(cardFaceElementsPerCardFaceIds: string[]): Observable<any[]> {
    console.log(`Delete saved card face elements per card face: ${cardFaceElementsPerCardFaceIds}`);
    if (cardFaceElementsPerCardFaceIds.length <= 0) {
      return of([]);
    }
    
    let deleteObservables: Observable<void>[] = [];
    while (cardFaceElementsPerCardFaceIds.length > 0) {
      let id: string | undefined = cardFaceElementsPerCardFaceIds.pop();
      if (id !== undefined) {
        deleteObservables.push(this.cardFaceElementApiService.deleteCardFaceElementPerCardFace$(id));
      }
    }
  
    // Return a single observable that completes when all deletes are done
    return forkJoin(deleteObservables);
  }

  private deleteTagsPerCard$(tagNamesToDelete: string[], cardId: string): Observable<any> {
    console.log(`Delete saved card face elements per card face: ${this.cardFaceElementsPerCardFaceToDeleteIds}`);
    if (tagNamesToDelete.length <= 0) {
      return of(undefined);
    }
    
    return this.tagsPerCardApiService.deleteByTagNamesAndCardId$(tagNamesToDelete, cardId);
  }

  constructor() {
    this.setCurrentCardEditorCardFaceDto();
  }

  isNewCardEditorCardDto(): boolean {
    return parseFloat(this.cardEditorCardDto.card.cardId) <= 0;
  }

  setOnCreateCardFaceElementPerCardFace(type: string, dndPosition: DndPosition){
    this.onCreateCardFaceElementPerCardFace$$.next({type, dndPosition});
  }

  setCurrentCardEditorCardFaceDto() {
    this.currentCardEditorCardFaceDto = this.cardEditorCardDto.cardEditorCardFacesDto[this.getCurrentCardFaceIndex()];
  }

  updateCardEditorCardFaceDto() {
    this.cardEditorCardDto.cardEditorCardFacesDto[this.getCurrentCardFaceIndex()] = this.currentCardEditorCardFaceDto;
  }

  setCardEditorCardDto(newCardEditorCardDto: CardEditorCardDto) {
    if (!newCardEditorCardDto || parseFloat(newCardEditorCardDto.card.cardId) === undefined || parseFloat(newCardEditorCardDto.card.cardId) < 0) return;
    this.cardEditorCardDto = newCardEditorCardDto;
  }

  getCurrentCardFaceIndex(): number {
    return this.cardEditorCardDto.card.currentCardFaceIndex;
  }

  getCurrentCardFace(): CardFace {
    return this.currentCardEditorCardFaceDto.cardFace;
  }

  getCardTagNames(): string[] {
    return this.cardEditorCardDto.tagNames;
  }

  setOnFlip() {
    this.onFlip$$.next();
  }

  onFlipCurrentCardFace() {
    this.cardEditorCardDto.card.currentCardFaceIndex = (this.getCurrentCardFaceIndex() === 0) ? 1: 0;
    this.setCurrentCardEditorCardFaceDto();

    this.postFlip$$.next();
  }

  createCardFaceThumbnailImages$(cardEditorCardDto: CardEditorCardDto, cardFaceIndex: number, cardFaceThumbnailImages: FormData): Observable<string[] | undefined> {
    if (!cardFaceThumbnailImages) {
      return of(undefined);
    }

    return this.fileUploadApiService.uploadFiles$(cardFaceThumbnailImages, 'card-face').pipe(
      switchMap((result: string[] | undefined) => {
        // TODO: Why are the upload files not working
        console.log('Upload card face thumbnail image result:', result);
        if (!result || result.length <= 0) return of(undefined);


        // ASSUMPTION: The cardFacePerLods already have elements beforehand, set in the blank card template
        // CHECKME: Would we even need this check
        /*if (!cardFacePerLods || cardFacePerLods.length === 0)
          throw Error("No LODs associated with card face to add thumbnail images to");*/

        // console.log(`Card face thumbnail LODs before orphaning file metadata: ${JSON.stringify(cardFacePerLods, null, 2)}`);

        // Because files are automatically created, we just want to delay and see whether we'd need to delete those files in the first place
        // As this is before saving or creating
        let fileMetadataLods: FileMetadata[] = cardEditorCardDto.cardEditorCardFacesDto[cardFaceIndex].fileMetadataLods;

        if (fileMetadataLods.length > 0) fileMetadataLods.map((fm: FileMetadata) => {
          this.orphanedFileMetadata.push(fm);
        });

        // TODO: Really do replace this, it shouldn't be here
        let cardFaceFilePath: string = "/app/backend/card-face-thumbnail-images";

        // We assume that the file's not used immediately because this is at the stage before creating, saving, etc.
        // When we get to that point, the backend will handle setting creationDate to null
        return createFilesMetadata$(this.fileMetadataApiService, cardFaceFilePath, result, FileMetadataStatus.Pending).pipe(
          map((filesMetadata: FileMetadata[] | undefined) => {
            if (!filesMetadata || filesMetadata.length <= 0)
              return result;

            fileMetadataLods = filesMetadata;

            let fileNames: string[] = [];

            filesMetadata.forEach((fm: FileMetadata) => {
              fileNames.push(fm.fileName);
            });

            return fileNames;
          }),
          takeUntilDestroyed(this.destroyRef)
        );
      })
    )
  }

  // Again, this should be fine, we're not going to override anything, just upload the files and link to a new URL, because automatic file deletion's a thing we can do
  createCardFaceThumbnailImage$(cardFaceIndex: number, cardFaceThumbnailImage: FormData): Observable<string | undefined> {
    if (!cardFaceThumbnailImage) {
      return of(undefined);
    }

    return this.fileUploadApiService.uploadFile$(cardFaceThumbnailImage, 'card-face').pipe(
      switchMap((result: { id: string | undefined }) => {
        console.log('Upload card face thumbnail image result:', result);
        if (!result.id) return of(undefined);

        // Because files are automatically created, we just want to delay and see whether we'd need to delete those files in the first place
        // As this is before saving or creating
        if (this.cardEditorCardDto.cardEditorCardFacesDto[cardFaceIndex].cardFace.cardFaceThumbnailFileMetadata !== undefined) {
          this.orphanedFileMetadata.push(this.cardEditorCardDto.cardEditorCardFacesDto[cardFaceIndex].cardFace.cardFaceThumbnailFileMetadata);
        }

        // TODO: Really do replace this, it shouldn't be here
        let cardFaceFilePath = "/app/backend/card-face-thumbnail-images";

        // We assume that the file's not used immediately because this is at the stage before creating, saving, etc.
        // When we get to that point, the backend will handle setting creationDate to null
        return createFileMetadata$(this.fileMetadataApiService, cardFaceFilePath, result.id, FileMetadataStatus.Pending).pipe(
          map((fileMetadata: FileMetadata | undefined) => {
            if (fileMetadata === undefined)
              return result.id;

            this.cardEditorCardDto.cardEditorCardFacesDto[cardFaceIndex].cardFace.cardFaceThumbnailFileMetadata = fileMetadata;
            
            return fileMetadata.fileName;
          }),
          takeUntilDestroyed(this.destroyRef)
        );
      })
    );
  }

  orphanFileMetadata(fileMetadata: FileMetadata[]) {
    fileMetadata.forEach((fm: FileMetadata) => {
      fm.fileMetadataStatus = FileMetadataStatus.Orphaned;
    });

    this.fileMetadataApiService.updateAllFileMetadata$(fileMetadata).subscribe({
      next: () => fileMetadata = [],
      error: err => console.error('Update all file metadata failed', err)
    });
  }

  // NOTE: This should be called whenever you upload an image
  // Again, returning it here should be fine, we're assignng the card face element content based on the return value anyways
  createCardFaceElementImage$(cardFaceElementImageId: string, cardFaceElementImage: FormData
  ): Observable<FileMetadata | undefined> {
    let found:  CardFaceElementPerCardFace | undefined = this.getCurrentCardFaceElementsPerCardFace()
      .find(c => c.cardFaceElement.cardFaceElementId === cardFaceElementImageId && c.cardFaceElement.cardFaceElementType === "Image");

    if (!found || found.cardFaceElement.cardFaceElementType !== "Image")
      return EMPTY;

    let imageFileMetadata: FileMetadata | undefined = (found.cardFaceElement as CardFaceElementImage).imageFileMetadata;

    if (cardFaceElementImage !== undefined) {
      return this.fileUploadApiService.uploadFile$(cardFaceElementImage, 'card-face-element-image').pipe(
        switchMap((result: { id: string | undefined }) => {
          console.log('Upload card face element image result:', result);
          if (!result.id) return of(undefined);

          let cardFaceElementImageFilePath = "/app/backend/card-face-elements-images";
        
          return createFileMetadata$(this.fileMetadataApiService, cardFaceElementImageFilePath, result.id, FileMetadataStatus.Pending).pipe(
            map((newFileMetadata: FileMetadata | undefined) => {
              console.log(`On create file metadata${JSON.stringify(newFileMetadata)}`);
              if (newFileMetadata) {
                // Basically assumes that we have a previous file metadata and am overriding it
                if (imageFileMetadata)
                  this.orphanedFileMetadata.push(imageFileMetadata);

                (found.cardFaceElement as CardFaceElementImage).imageFileMetadata = newFileMetadata;
                return newFileMetadata;
              }
        
               return undefined;
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      );
    }

    return of(undefined);
  }

  duplicateCardFaceThumbnails$(cardEditorCardDto: CardEditorCardDto): Observable<(FileMetadata[] | undefined)[]> {
    let itemsToDuplicate: {
      cardFace: CardFace;
      fileMetadataLods: FileMetadata[];
    }[] = cardEditorCardDto.cardEditorCardFacesDto
      .filter(dto => dto.cardFace && dto.fileMetadataLods)
      .map(dto => ({
        cardFace: dto.cardFace,
        fileMetadataLods: dto.fileMetadataLods
      }));

    // Emit an empty array if there are no observables to join to continue onto switch map
    if (itemsToDuplicate.length <= 0)
      return of([]);

    let duplicationObservables: Observable<FileMetadata[] | undefined>[] = itemsToDuplicate.map(item => duplicateFiles$(
      this.fileUploadApiService,
      this.fileMetadataApiService,
      item.fileMetadataLods,
      'card-face',
      '/app/backend/card-face-thumbnail-images'
    ).pipe(
      tap((newFileMetadataLods: FileMetadata[] | undefined) => {
        if (newFileMetadataLods) {
          item.fileMetadataLods = newFileMetadataLods;
        }
      })
    )
    );

    // Emit an empty array if there are no observables to join to continue onto switch map
    if (duplicationObservables.length === 0) {
      return of([]);
    }

    return forkJoin(duplicationObservables).pipe(takeUntilDestroyed(this.destroyRef));
  }

  duplicateCardFaceElementImages$(cardEditorCardDto: CardEditorCardDto): Observable<void> {
    let observables: Array<Observable<FileMetadata | undefined>> = [];
    let elements: CardFaceElementPerCardFace[] = [];
    let guidPattern: RegExp = /^(?:\{{0,1}(?:[0-9a-fA-F]){8}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){12}\}{0,1})$/;

    cardEditorCardDto.cardEditorCardFacesDto.forEach((cardEditorCardFaceDto: CardEditorCardFaceDto) => {
      cardEditorCardFaceDto.cardFaceElementsPerCardFace
        .filter(cardFaceElementPerCardFace =>
          cardFaceElementPerCardFace.cardFaceElement.cardFaceElementType === "Image" && cardFaceElementPerCardFace.cardFaceElement.cardFaceElementId.match(/^\d{17,19}$/)           // NOTE: This means that the card face image element hasn't actually been created yet and therefore doesn't have a Snowflake ID, there's no point of duplicating
        )
        .forEach((cardFaceElementPerCardFace: CardFaceElementPerCardFace) => {
          let cardFaceElementImage: CardFaceElementImage = cardFaceElementPerCardFace.cardFaceElement as CardFaceElementImage;
          
          // FIXED: Checking for undefined doesn't check for null. Couldn't add a card to room with nonexistent card face element image null file metadata
          if (!cardFaceElementImage.imageFileMetadata)
            return;
          
          // NOTE: Just checks to make sure that the file name actually matches teh pattern else you're going to get nothing back anyways
          if (!cardFaceElementImage.imageFileMetadata.fileName.match(guidPattern))
            return;

          observables.push(
            duplicateFile$(
              this.fileUploadApiService,
              this.fileMetadataApiService,
              cardFaceElementImage.imageFileMetadata,
              'card-face-element',
              '/app/backend/card-face-element-images'
            ).pipe(
              tap(newFileMetadata => {
                if (newFileMetadata) {
                  cardFaceElementImage.imageFileMetadata = newFileMetadata;
                }
              }),
              takeUntilDestroyed(this.destroyRef)
            )
          );

          elements.push(cardFaceElementPerCardFace);
        });
    });

    if (observables.length <= 0) {
      return of(undefined); // Ensures emission if nothing to duplicate
    }

    return forkJoin(observables).pipe(
      map(() => void 0),
      takeUntilDestroyed(this.destroyRef)
    );
  }



  getImageFormData$(content: string): Observable<FormData | undefined> {
    // Handle blob: URL or .png URL
    if (content.startsWith('blob:') || content.endsWith('.png')) {
      return from(fetch(content).then(res => res.blob())).pipe(
        switchMap(blob => {
          const formData = new FormData();
          formData.append('formFile', blob);
          return of(formData);
        }),
        takeUntilDestroyed(this.destroyRef)
      );
    }

    // Handle data: URL (base64)
    if (content.startsWith('data:image/')) {
      const base64 = content.replace(/^data:image\/\w+;base64,/, '');
      const byteString = atob(base64);
      const arrayBuffer = new ArrayBuffer(byteString.length);
      const intArray = new Uint8Array(arrayBuffer);

      for (let i = 0; i < byteString.length; i++) {
        intArray[i] = byteString.charCodeAt(i);
      }

      const blob = new Blob([intArray], { type: 'image/png' });
      const formData = new FormData();
      formData.append('formFile', blob);
      return of(formData);
    }

    // Unsupported type
    return of(undefined);
  }

  markOrphanedData() {
    if (this.orphanedFileMetadata.length <= 0) {
      console.warn('No files to orphan.');
      return;
    }


    this.orphanFileMetadata(this.orphanedFileMetadata);
  }

  // TODO: Create a function to get all text content, convert them to BB Code then save them
  // https://stackoverflow.com/questions/51860068/rxjs-6-conditionally-pipe-an-observable
  // https://www.learnrxjs.io/learn-rxjs/operators/conditional/iif
  createCard$(cardEditorCardDto: CardEditorCardDto): Observable<CardEditorCardDto | undefined> {
    return this.cardEditorCardDtoApiService.createCardEditorCardDto$(cardEditorCardDto).pipe(
      catchError(err => {
        console.error('Something went wrong:', err);
        return throwError(() => err);
      })
    );
  }

  duplicateCard$(cardEditorCardDto: CardEditorCardDto): Observable<CardEditorCardDto | undefined> {
    return forkJoin([
      this.duplicateCardFaceElementImages$(cardEditorCardDto),
      this.duplicateCardFaceThumbnails$(cardEditorCardDto),
    ]).pipe(
      switchMap(() =>
        this.cardEditorCardDtoApiService.createCardEditorCardDto$(cardEditorCardDto)
      ),
      catchError((err: unknown) => {
        console.error('Something went wrong:', err);
        return throwError(() => err);
      })
    );
  }

  // NOTE: Order should go pending, orphaned, and finally, attached
  // Even if you don't orphan it, it's assumed that it's pending, until you have attached it
  modifyCardPostApiOperation(cardEditorCardDto: CardEditorCardDto | undefined): void {
    this.setCardEditorCardDtoPostApiOperation(cardEditorCardDto);

    if (cardEditorCardDto)
      this.markOrphanedData();
  }

  // NOTE: Why this.cardEditorCardDto?
  // ASSUMPTION: We are updating the card editor card dto for the CARD EDITOR
  createCardPostApiOperation(cardEditorCardDto: CardEditorCardDto | undefined): void {
    this.modifyCardPostApiOperation(cardEditorCardDto);

    this.setOnCreateCardEditorCardDto(this.cardEditorCardDto);  

    // We don't want to clear the items to be deleted because it's possible that we're updating the card instead of duplicating it
    // So that's why it gets cleared when we switch the card instead
  }

  duplicateCardPostApiOperation(cardEditorCardDto: CardEditorCardDto | undefined): void {
    this.setCardEditorCardDtoPostApiOperation(cardEditorCardDto);

    this.setOnCreateCardEditorCardDto(this.cardEditorCardDto);  

    // Because we're making a duplicate, you don't want to store the card face elements to delete, only do it for saving
    // We also want to set the to be oprhaned metadata to be nothing, since we're starting with a newly duplicated card
    this.clearItemsToBeDeleted();
  }

  updateCardPostApiOperation(cardEditorCardDto: CardEditorCardDto): void {
    this.modifyCardPostApiOperation(cardEditorCardDto);

    this.setOnUpdateCardEditorCardDto(this.cardEditorCardDto);

    // CHECKME: Do we want to call it here?
    // This should theoretically be fine because we mark the file metadata as orphaned beforehand
    this.clearItemsToBeDeleted();
  }

  private clearItemsToBeDeleted(): void {
    this.orphanedFileMetadata = [];
    this.cardFaceElementsPerCardFaceToDeleteIds = [];
    this.tagNamesToDelete = [];
  }

  // TODO: With update, do we want to clearItemsToBeDeleted?

  setCardEditorCardDtoPostApiOperation(cardEditorCardDto: CardEditorCardDto | undefined): void {
    if (!isCardEditorCardDto(cardEditorCardDto))
      throw new Error("Post API operation: not a card editor card dto")

    this.cardEditorCardDto = cardEditorCardDto;
    this.reloadCurrentCardEditorCardFaceDto();
  }

  updateCard$(cardEditorCardDto: CardEditorCardDto, cardFaceElementsPerCardFaceToDeleteIds: string[], tagNamesToDelete: string[]): Observable<CardEditorCardDto | undefined> {
    let shouldDeleteItems: boolean = 
      cardFaceElementsPerCardFaceToDeleteIds.length > 0 || 
      tagNamesToDelete.length > 0;

    return iif(
      () => shouldDeleteItems,
      forkJoin([
        this.deleteSavedCardFaceElementsPerCardFace$(cardFaceElementsPerCardFaceToDeleteIds),
        this.deleteTagsPerCard$(tagNamesToDelete, cardEditorCardDto.card.cardId)
      ]),
      of([undefined, undefined])
    )
      .pipe(
        catchError(err => {
          console.error('Delete error (ignored):', err);
          return of([undefined, undefined]); // NOTE: Ignores this because you can't delete what doesn't exist and it should continue either way
        }),
        switchMap(() => this.cardEditorCardDtoApiService.updateCardEditorCardDto$(cardEditorCardDto)),
        catchError((err: unknown) => {
          console.error('Something went wrong:', err);
          return throwError(() => err);
        }),
        takeUntilDestroyed(this.destroyRef)
      );
  }

  // NOTE: Only use when you're not editing the card
  deleteCard(cardId: string)
  {
    if (this.cardEditorCardDto.card.cardId === cardId) {
      throw new Error("Can't delete card as it's being edited");
    }

    this.cardEditorCardDtoApiService.deleteCardEditorCardDtoByCardId$(cardId)
    .subscribe(() => { this.setOnDeleteCardEditorCardDto(cardId);});
  }

  reloadCurrentCardEditorCardFaceDto() {
    this.currentCardEditorCardFaceDto = this.cardEditorCardDto.cardEditorCardFacesDto[this.getCurrentCardFaceIndex()];
  }

  setOnCreateCardEditorCardDto(cardEditorCardDto: CardEditorCardDto): void {
    this.onCreateCardEditorCardDto$$.next(cardEditorCardDto);
  }

  setOnUpdateCardEditorCardDto(cardEditorCardDto: CardEditorCardDto): void {
    this.onUpdateCardEditorCardDto$$.next(cardEditorCardDto);
  }

  setOnDeleteCardEditorCardDto(cardId: string) {
    this.onDeleteCardEditorCardDto$$.next(cardId);
  }

  updateCurrentCardFaceStyle(currentCardFaceStyle: Style) {
    this.currentCardEditorCardFaceDto.cardFace.style = currentCardFaceStyle;
  }

  // NOTE: Case insensitive, accent sensitive
  isCardTemplate(cardEditorCardDto: CardEditorCardDto): boolean {
    return cardEditorCardDto.tagNames
      .some(tag => tag.localeCompare('Template', undefined, { sensitivity: 'accent' }) === 0);
  }

  addTag(tag: Tag, cardEditorCardDto: CardEditorCardDto, tagNamesToDelete?: string[]): void {
    if (cardEditorCardDto.tagNames.includes(tag.tagName))
      throw new Error("Already has tag name included");

    cardEditorCardDto.tagNames.push(tag.tagName);

    if (!tagNamesToDelete)
      return;

    tagNamesToDelete = tagNamesToDelete.filter((t: string) => t !== tag.tagName);

     if (tagNamesToDelete.includes(tag.tagName))
      throw new Error(`Tag names to delete should not include: ${tag.tagName} after filtering`);
  }

  // ASSUMPTION: When you add/remove to the template, it keeps the exact order in the array of the cardEditorCardDto
  updateTag(idx: number, tag: Tag, cardEditorCardDto: CardEditorCardDto, tagNamesToDelete?: string[]): void {
    if (!cardEditorCardDto.tagNames[idx])
      throw new Error("Index for this tag does not exist");

    if (tagNamesToDelete) tagNamesToDelete.push(cardEditorCardDto.tagNames[idx]);
    
    cardEditorCardDto.tagNames[idx] = tag.tagName;
  }

  deleteTag(tag: Tag, cardEditorCardDto: CardEditorCardDto, tagNamesToDelete?: string[]): void {
    cardEditorCardDto.tagNames = cardEditorCardDto.tagNames.filter((t: string) => t !== tag.tagName);
    
    if (cardEditorCardDto.tagNames.includes(tag.tagName))
      throw new Error(`Tag names should not include: ${tag.tagName} after filtering`);
  
    if (tagNamesToDelete) tagNamesToDelete.push(tag.tagName);
  }
}
