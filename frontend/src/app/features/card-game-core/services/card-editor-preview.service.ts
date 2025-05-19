import { DestroyRef, effect, inject, Injectable } from '@angular/core';
import { CardEditorCardFaceDto, CardFace } from '../models/card-face';
import { CardEditorCardDto } from '../models/card';
import { CardFaceElement, CardFaceElementImage, CardFaceElementPerCardFace } from '../models/card-face-element';
import { catchError, concatMap, defer, EMPTY, forkJoin, from, iif, map, mergeMap, Observable, of, Subject, switchMap, tap } from 'rxjs';
import { FileUploadApiService } from '../../../utils/services/file-upload-api.service';
import { CardGameCoreService } from './card-game-core/card-game-core.service';
import { CardApiService } from './card-game-core/card-api.service';
import { isCardEditorCardDto } from '../utils/card-game-core.utils';
import { Style } from '../../style/models/style';
import { DndPosition } from '../../drag-and-drop/models/dnd-types';
import { CardFaceElementApiService } from './card-game-core/card-face-element-api.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FileMetadata, FileMetadataStatus } from '../../../utils/models/file-metadata';
import { FileMetadataApiService } from '../../../utils/services/file-metadata-api.service';

@Injectable({
  providedIn: 'root'
})
export class CardEditorPreviewService {
  private readonly cardGameCoreService: CardGameCoreService = inject(CardGameCoreService);
  private readonly cardApiService: CardApiService = inject(CardApiService);
  private readonly fileUploadApiService = inject(FileUploadApiService);
  private readonly cardFaceElementApiService: CardFaceElementApiService = inject(CardFaceElementApiService);
  
  private destroyRef: DestroyRef = inject(DestroyRef);

  defaultCardEditorFaceStyle: Style = {
    styleId: "0",
    backgroundColor: '#fefffe',
    aspectRatio: '63/88',
    height: '483px',
    // height: '80%',
    minHeight: '80%',
    display: 'block',
    position: 'relative',
    borderRadius: '10px',
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
          style: this.defaultCardEditorFaceStyle,
        },
        cardFaceElementsPerCardFace: [
        ]
      },
      {
        cardFace: {
          cardFaceId: "-1",
          style: this.defaultCardEditorFaceStyle,
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
            style: this.defaultCardEditorFaceStyle,
          },
          cardFaceElementsPerCardFace: [
          ]
        },
        {
          cardFace: {
            cardFaceId: "-1",
            style: this.defaultCardEditorFaceStyle,
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

  // TODO: Get rid of this
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

  // TODO: Fix how this check actually works, just check whether it exists in the database because we gotta use the Snowflake Algorithm
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

  markFileMetadataStatus(fileMetadata: FileMetadata, fileMetadataStatus: FileMetadataStatus) {
   fileMetadata.fileMetadataStatus = fileMetadataStatus;

    this.fileMetadataApiService.updateFileMetadata$(fileMetadata.fileMetadataId, fileMetadata).subscribe();
  }

  attachFileMetadata(fileMetadata: FileMetadata[]) {
    fileMetadata.forEach((fm: FileMetadata) => {
      this.markFileMetadataStatus(fm, FileMetadataStatus.Attached);
    })
  }

  orphanFileMetadata(fileMetadata: FileMetadata[]) {
    fileMetadata.forEach((fm: FileMetadata) => {
      this.markFileMetadataStatus(fm, FileMetadataStatus.Orphaned);
    })
  }

  attachAllCardFaceThumbnails(cardEditorCardDto: CardEditorCardDto) {
    let fileMetadatas: FileMetadata[] = cardEditorCardDto.cardEditorCardFacesDto
      .map((cardEditorCardFaceDto: CardEditorCardFaceDto) => cardEditorCardFaceDto.cardFace.cardFaceThumbnailFileMetadata)
      .filter((fm): fm is FileMetadata => fm != null);

    this.attachFileMetadata(fileMetadatas);
  }

  attachAllCardFaceElementImages(cardEditorCardDto: CardEditorCardDto) {
    let fileMetadatas: FileMetadata[] = cardEditorCardDto.cardEditorCardFacesDto
      .flatMap(cardEditorCardFaceDto =>
        cardEditorCardFaceDto.cardFaceElementsPerCardFace
          .filter(el => el.cardFaceElement.cardFaceElementType === "Image")
          .map(el => (el.cardFaceElement as CardFaceElementImage).imageFileMetadata)
          .filter((fm): fm is FileMetadata => fm != null)
      );

    this.attachFileMetadata(fileMetadatas);
  }

  // This is for when you're deleting cards
  orphanAllCardFaceThumbnails(cardEditorCardDto: CardEditorCardDto) {
     let fileMetadatas: FileMetadata[] = cardEditorCardDto.cardEditorCardFacesDto
      .map((cardEditorCardFaceDto: CardEditorCardFaceDto) => cardEditorCardFaceDto.cardFace.cardFaceThumbnailFileMetadata)
      .filter((fm): fm is FileMetadata => fm != null);

    this.orphanFileMetadata(fileMetadatas);
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

    let duplicationObservables = itemsToDuplicate.map(item => this.duplicateFile$(item.fileMetadata, 'card-face', '/app/backend/card-face-thumbnail-images').pipe(
        tap((newFileMetadata: FileMetadata | undefined) => {
          if (newFileMetadata) {
            item.fileMetadata = newFileMetadata;
          }
        })
      )
    );

    // Run all in parallel and return the results as an array
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

    cardEditorCardDto.cardEditorCardFacesDto.forEach((cardEditorCardFaceDto: CardEditorCardFaceDto) => {
      cardEditorCardFaceDto.cardFaceElementsPerCardFace
        .filter(cardFaceElementPerCardFace =>
          cardFaceElementPerCardFace.cardFaceElement.cardFaceElementType === "Image" && cardFaceElementPerCardFace.cardFaceElement.cardFaceElementId.match(/^\d{17,19}$/)           // NOTE: This means that the card face image element hasn't actually been created yet and therefore doesn't have a Snowflake ID, there's no point of duplicating
        )
        .forEach((cardFaceElementPerCardFace: CardFaceElementPerCardFace) => {
          let cardFaceElementImage: CardFaceElementImage = cardFaceElementPerCardFace.cardFaceElement as CardFaceElementImage;
          
          if (cardFaceElementImage.imageFileMetadata === undefined)
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
    while (this.orphanedFileMetadata.length > 0) {
      let orphaned: FileMetadata | undefined = this.orphanedFileMetadata.pop();
      
      if (orphaned === undefined)
        continue;
      
      this.markFileMetadataStatus(orphaned, FileMetadataStatus.Orphaned);
    }
  }

  postCardApiOperation() {
    this.markOrphanedData();

    // We want to set the file metadata to attached when we create the card, because there's no point of updating it from pending unless it's actually already created
    this.attachAllCardFaceThumbnails(this.cardEditorCardDto);
    this.attachAllCardFaceElementImages(this.cardEditorCardDto);
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

            this.postCardApiOperation();
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

            // TODO: Remember to use file metadata file path instead of thumbnail image file path
            this.cardGameCoreService.setOnCreateCardEditorCardDto(this.cardEditorCardDto);

            this.postCardApiOperation();

            // Because we're making a duplicate, you don't want to store the card face elements to delete, only do it for saving
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

            // TODO: Remember to use file metadata file path instead of thumbnail image file path
            this.cardGameCoreService.setOnUpdateCardEditorCardDto(this.cardEditorCardDto);
          
            this.postCardApiOperation();
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

    // We're just marking the file metadata
    // Furthermore, when we're deleting a card, we're not actually modifying the metadata in any way
    this.cardApiService.getCardEditorCardDtoByCardId$(cardId)
      .pipe(
        tap((cardEditorCardDto: CardEditorCardDto | undefined) => {
          if (cardEditorCardDto) {
            this.orphanAllCardFaceThumbnails(cardEditorCardDto)
          }
        },
        ),
        switchMap(() => this.cardApiService.deleteCardEditorCardDto$(cardId)),
      )
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
