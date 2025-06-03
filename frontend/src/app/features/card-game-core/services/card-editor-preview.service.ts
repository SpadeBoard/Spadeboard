import { DestroyRef, effect, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, forkJoin, from, iif, map, Observable, of, Subject, switchMap, tap } from 'rxjs';
import { FileMetadata, FileMetadataStatus } from '../../../utils/models/file-metadata';
import { FileMetadataApiService } from '../../../utils/services/file-metadata-api.service';
import { FileUploadApiService } from '../../../utils/services/file-upload-api.service';
import { DndPosition } from '../../drag-and-drop/models/dnd-types';
import { Style } from '../../style/models/style';
import { CardEditorCardDto } from '../models/card';
import { CardEditorCardFaceDto, CardFace } from '../models/card-face';
import { CardFaceElementImage, CardFaceElementPerCardFace } from '../models/card-face-element';
import { isCardEditorCardDto } from '../utils/card-game-core.utils';
import { CardApiService } from './card-game-core/card-api.service';
import { CardFaceElementApiService } from './card-game-core/card-face-element-api.service';
import { CardGameCoreService } from './card-game-core/card-game-core.service';

@Injectable({
  providedIn: 'root'
})
export class CardEditorPreviewService {
  private readonly cardGameCoreService: CardGameCoreService = inject(CardGameCoreService);
  private readonly cardApiService: CardApiService = inject(CardApiService);
  private readonly fileUploadApiService = inject(FileUploadApiService);
  private readonly cardFaceElementApiService: CardFaceElementApiService = inject(CardFaceElementApiService);
  
  private destroyRef: DestroyRef = inject(DestroyRef);

  readonly MAX_CURRENT_ELEMENTS_PER_CARD_FACE: number = 20;
  readonly MAX_CARD_FACE_WIDTH: number = 500;
  readonly MAX_CARD_FACE_HEIGHT: number = 800;
  readonly MAX_BORDER_RADIUS: number = 100;

  defaultCardEditorFaceStyle: Style = {
    styleId: "0",
    backgroundColor: '#fefffe',
    width: '351px',
    height: '483px',
    // height: '80%',
    minWidth: '25%',
    minHeight: '25%',
    maxWidth: `${this.MAX_CARD_FACE_WIDTH}px`,
    maxHeight: `${this.MAX_CARD_FACE_HEIGHT}px`,
    display: 'block',
    position: 'relative',
    borderRadius: '10px',
    borderStyle: 'solid', // Set border left width, etc.
    borderColor: '#fefffe',
    borderWidth: '2px',
    fontSize: '14px'
    /*overflow: hidden;*/
  }

  // FIXME: Reset this everytime you open the card editor via the button on the side
  cardEditorCardDto: CardEditorCardDto = {
    card: {
      cardId: "0",
      currentCardFaceIndex: 0,
      cardName: '',
      isTemplate: false
    },
    ownerId: '5811e387-1551-4090-9485-a3ebe30efb5a',
    cardEditorCardFacesDto: [
      {
        cardFace: {
          cardFaceId: "0",
          style: {...this.defaultCardEditorFaceStyle}, //FIXED: What was happening is that due to them sharing the same reference to the same object, they were both being updated simultaneously. Because when you assign style to this.defaultCardEditorFaceStyle, you're not assigning by value, you're literally equating it to the object itself. AGH.  When you later update face.style (e.g., set borderRadius or backgroundColor), you are mutating that single object, so both card faces reflect the change.
        },
        cardFaceElementsPerCardFace: [
        ]
      },
      {
        cardFace: {
          cardFaceId: "-1",
          style: {...this.defaultCardEditorFaceStyle},
        },
        cardFaceElementsPerCardFace: []
      }
    ]
  };

  currentCardEditorCardFaceDto: CardEditorCardFaceDto = {
    cardFace: {
      cardFaceId: "0",
      style: {
        styleId: "0"
      }
    },
    cardFaceElementsPerCardFace: []
  };

  cardFaceImages: FormData[] = [];

  private orphanedFileMetadata: FileMetadata[] = [

  ];
  private cardFaceElementsPerCardFaceDelete: string[] = [

  ];

  private onFlip$$: Subject<void> = new Subject<void>();
  onFlip$: Observable<void> = this.onFlip$$.asObservable();

   private postFlip$$: Subject<void> = new Subject<void>();
  postFlip$: Observable<void> = this.postFlip$$.asObservable();

  private onCreateCard$$: Subject<void> = new Subject<void>();
  onCreateCard$: Observable<void> = this.onCreateCard$$.asObservable();

  private onUpdateCard$$: Subject<void> = new Subject<void>();
  onUpdateCard$: Observable<void> = this.onUpdateCard$$.asObservable();

  private onDeleteCardFaceElementPerCardFace$$: Subject<void> = new Subject<void>();
  onDeleteCardFaceElementPerCardFace$: Observable<void> = this.onDeleteCardFaceElementPerCardFace$$.asObservable();

  private onCreateCardFaceElementPerCardFace$$: Subject<{type: string, dndPosition: DndPosition}> = new Subject<{type: string, dndPosition: DndPosition}>();
  onCreateCardFaceElementPerCardFace$: Observable<{type: string, dndPosition: DndPosition}> = this.onCreateCardFaceElementPerCardFace$$.asObservable();

  private onSetCardEditorCardDtoByCardId$$: Subject<void> = new Subject<void>();
  onSetCardEditorCardDtoByCardId$: Observable<void> = this.onSetCardEditorCardDtoByCardId$$.asObservable();
  
  private readonly fileMetadataApiService: FileMetadataApiService = inject(FileMetadataApiService);

  // NOTE: For when clicking on a blank card template
  setBlankCardTemplate() {
    this.cardEditorCardDto = {
      card: {
        cardId: "0",
        currentCardFaceIndex: 0,
        cardName: '',
        isTemplate: false
      },
      ownerId: '5811e387-1551-4090-9485-a3ebe30efb5a',
      cardEditorCardFacesDto: [
        {
          cardFace: {
            cardFaceId: "0",
            style: {...this.defaultCardEditorFaceStyle},
          },
          cardFaceElementsPerCardFace: [
          ]
        },
        {
          cardFace: {
            cardFaceId: "-1",
            style: {...this.defaultCardEditorFaceStyle},
          },
          cardFaceElementsPerCardFace: []
        }
      ]
    };
  }

  setCardEditorCardDtoByCardId(cardId: string) {
    // Prevents accidentally orphaning file metadata we stored for a previous card but never did anything with it
    this.orphanedFileMetadata = [];

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

    this.cardApiService.getCardEditorCardDtoByCardId$(cardId)
    .pipe(
      takeUntilDestroyed(this.destroyRef)
    )
    .subscribe(cardEditorCardDto => this.handleCardEditorCardDto(cardEditorCardDto));
  }

  getCardEditorCardDtoByCardId(cardId: string) {
     this.cardApiService.getCardEditorCardDtoByCardId$(cardId)
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
      this.cardFaceElementsPerCardFaceDelete.push(cardFaceElementPerCardFaceId);

      console.log(`Delete card face element per card face: ${this.cardFaceElementsPerCardFaceDelete}`);
    }

    this.currentCardEditorCardFaceDto.cardFaceElementsPerCardFace = this.currentCardEditorCardFaceDto.cardFaceElementsPerCardFace.filter(c => c.cardFaceElementPerCardFaceId !== cardFaceElementPerCardFaceId);
    this.onDeleteCardFaceElementPerCardFace$$.next();
  }

  doesCardFaceElementPerCardFaceToDeleteExistInDatabase(cardFaceElementPerCardFaceId: string): boolean {
    return /^\d{17,20}$/.test(cardFaceElementPerCardFaceId);
  }

  // / TODO: Only delete the backend on update card or template, keep track of IDs to delete
  private deleteSavedCardFaceElementsPerCardFace$(): Observable<any[]> {
    console.log(`Delete saved card face elements per card face: ${this.cardFaceElementsPerCardFaceDelete}`);
    if (this.cardFaceElementsPerCardFaceDelete.length <= 0) {
      return of([]);
    }
    
    let deleteObservables: Observable<void>[] = [];
    while (this.cardFaceElementsPerCardFaceDelete.length > 0) {
      let id: string | undefined = this.cardFaceElementsPerCardFaceDelete.pop();
      if (id !== undefined) {
        deleteObservables.push(this.cardFaceElementApiService.deleteCardFaceElementPerCardFace$(id));
      }
    }
  
    // Return a single observable that completes when all deletes are done
    return forkJoin(deleteObservables);
  }

  constructor() {
    // this.setBlankCardTemplate();
    this.setCurrentCardEditorCardFaceDto();

    effect(() => {
      if (parseFloat(this.cardGameCoreService.cardEditorCardDto().card.cardId) !== undefined && parseFloat(this.cardGameCoreService.cardEditorCardDto().card.cardId) as number > 0) {
        this.setCardEditorCardDto(this.cardGameCoreService.cardEditorCardDto());      
        this.setCurrentCardEditorCardFaceDto();
      }
    });
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

  setOnFlip() {
    this.onFlip$$.next();
  }

  onFlipCurrentCardFace() {
    this.cardEditorCardDto.card.currentCardFaceIndex = (this.getCurrentCardFaceIndex() === 0) ? 1: 0;
    this.setCurrentCardEditorCardFaceDto();

    this.postFlip$$.next();
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
        return this.createFileMetadata$(cardFaceFilePath, result.id, FileMetadataStatus.Pending).pipe(
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


  createFileMetadata$(volumePath: string, fileName: string, fileMetadataStatus: FileMetadataStatus
  ): Observable<FileMetadata | undefined> {
    const fileMetadata: FileMetadata = {
      fileMetadataId: '0',
      volumePath: volumePath,
      fileName: fileName,
      creationDate: new Date(),
      fileMetadataStatus: fileMetadataStatus
    };

    return this.fileMetadataApiService.createFileMetadata$(fileMetadata).pipe(
      tap(result => {
        if (result === undefined) {
          throw new Error("File metadata wasn't able to be created");
        }
        console.log(`Created file metadata: ${JSON.stringify(result)}`);
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
        
          return this.createFileMetadata$(cardFaceElementImageFilePath, result.id, FileMetadataStatus.Pending).pipe(
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

  duplicateCardFaceThumbnails$(cardEditorCardDto: CardEditorCardDto): Observable<(FileMetadata | undefined)[]> {
    let itemsToDuplicate =cardEditorCardDto.cardEditorCardFacesDto
      .filter(dto => dto.cardFace && dto.cardFace.cardFaceThumbnailFileMetadata)
      .map(dto => ({
        fileMetadata: dto.cardFace.cardFaceThumbnailFileMetadata!,
        cardFace: dto.cardFace
      }));

    // Emit an empty array if there are no observables to join to continue onto switch map
    if (itemsToDuplicate.length <= 0)
      return of([]);

    let duplicationObservables = itemsToDuplicate.map(item => this.duplicateFile$(item.fileMetadata, 'card-face', '/app/backend/card-face-thumbnail-images').pipe(
        tap((newFileMetadata: FileMetadata | undefined) => {
          if (newFileMetadata) {
            item.fileMetadata = newFileMetadata;
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

  duplicateFile$(fileMetadata: FileMetadata, fileType: string, filePath: string): Observable<FileMetadata | undefined> {
    return this.fileUploadApiService.replaceFilePath$(fileMetadata.fileName, fileType).pipe(
      switchMap((result: { id: string | undefined }) => {
        if (!result.id) return of(undefined);
        return this.createFileMetadata$(filePath, result.id, FileMetadataStatus.Pending);
      })
    );
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
            this.duplicateFile$(
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
    if (this.orphanedFileMetadata.length <= 0)
      throw new Error("No files to orphan");

    this.orphanFileMetadata(this.orphanedFileMetadata);
  }

  // TODO: Create a function to get all text content, convert them to BB Code then save them
  createCard(): void {
    // https://stackoverflow.com/questions/51860068/rxjs-6-conditionally-pipe-an-observable
    // https://www.learnrxjs.io/learn-rxjs/operators/conditional/iif

    if (!this.isNewCardEditorCardDto())
      throw new Error("Creating from a previous card and therefore should be duplicated");

    this.cardApiService.createCardEditorCardDto$(this.cardEditorCardDto)
      .subscribe({
        next: (createResult: CardEditorCardDto | undefined) => {
          if (isCardEditorCardDto(createResult)) {
            this.cardEditorCardDto = createResult;

            this.reloadCurrentCardEditorCardFaceDto();

            this.setOnCreateCard();
            this.cardGameCoreService.setOnCreateCardEditorCardDto(this.cardEditorCardDto);   
            
            this.markOrphanedData();
          }
        },
        error: (err) => {
          console.error('Something went wrong:', err);
        }
      });
  }

  duplicateCard(): void {
    // https://stackoverflow.com/questions/51860068/rxjs-6-conditionally-pipe-an-observable
    // https://www.learnrxjs.io/learn-rxjs/operators/conditional/iif

    // Conditionally returns one observable or another, and you can then chain your API cal
    if (this.isNewCardEditorCardDto())
      throw new Error("Card is new and therefore should not be duplicated");

    forkJoin([
      this.duplicateCardFaceElementImages$(this.cardEditorCardDto),
      this.duplicateCardFaceThumbnails$(this.cardEditorCardDto),
    ])
      .pipe(
        switchMap(() => this.cardApiService.createCardEditorCardDto$(this.cardEditorCardDto)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (createResult: CardEditorCardDto | undefined) => {
          if (isCardEditorCardDto(createResult)) {
            this.cardEditorCardDto = createResult;

            this.reloadCurrentCardEditorCardFaceDto();

            this.setOnCreateCard();
            this.cardGameCoreService.setOnCreateCardEditorCardDto(this.cardEditorCardDto);    // TODO: Remember to use file metadata file path instead of thumbnail image file path

            // Because we're making a duplicate, you don't want to store the card face elements to delete, only do it for saving
            // We also want to set the to be oprhaned metadata to be nothing, since we're starting with a newly duplicated card
            this.orphanedFileMetadata = [];
            this.cardFaceElementsPerCardFaceDelete = [];
          }
        },
        error: (err) => {
          console.error('Something went wrong:', err);
        }
      });
  }

  updateCard(): void {
    let shouldDelete: boolean = this.cardFaceElementsPerCardFaceDelete.length > 0;

    iif(
      () => shouldDelete,
      this.deleteSavedCardFaceElementsPerCardFace$(),
      of(undefined)
    )
      .pipe(
        catchError(err => {
          console.error('Delete error (ignored):', err);
          return of([]); // NOTE: Ignores this because you can't delete what doesn't exist and it should continue either way
        }),
        switchMap(() => this.cardApiService.updateCardEditorCardDto$(this.cardEditorCardDto)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (updateResult: CardEditorCardDto | undefined) => {
          if (isCardEditorCardDto(updateResult)) {
            console.log(`Update card - result: ${JSON.stringify(updateResult)}`);

            this.cardEditorCardDto = updateResult;

            this.reloadCurrentCardEditorCardFaceDto();

            this.setOnUpdateCard();
            this.cardGameCoreService.setOnUpdateCardEditorCardDto(this.cardEditorCardDto);   // TODO: Remember to use file metadata file path instead of thumbnail image file path
          
            this.markOrphanedData();
          }
        },
        error: (err) => {
          console.error('Something went wrong:', err);
        }
      });
  }

  deleteCard(cardId: string)
  {
    if (this.cardEditorCardDto.card.cardId === cardId) {
      throw new Error("Can't delete card as it's being edited");
    }

    this.cardApiService.deleteCardEditorCardDto$(cardId)
    .subscribe(() => { this.cardGameCoreService.setOnDeleteCardEditorCardDto(cardId);});
  }

  reloadCurrentCardEditorCardFaceDto() {
    this.currentCardEditorCardFaceDto = this.cardEditorCardDto.cardEditorCardFacesDto[this.getCurrentCardFaceIndex()];
  }

  setOnCreateCard() {
    this.onCreateCard$$.next();
  }

  setOnUpdateCard() {
    this.onUpdateCard$$.next();
  }

  updateCurrentCardFaceStyle(currentCardFaceStyle: Style) {
    this.currentCardEditorCardFaceDto.cardFace.style = currentCardFaceStyle;
  }
}
