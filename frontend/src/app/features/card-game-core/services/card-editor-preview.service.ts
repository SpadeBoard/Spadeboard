import { DestroyRef, effect, inject, Injectable } from '@angular/core';
import { CardEditorCardFaceDto, CardFace } from '../models/card-face';
import { CardEditorCardDto } from '../models/card';
import { CardFaceElement, CardFaceElementPerCardFace } from '../models/card-face-element';
import { catchError, concatMap, defer, EMPTY, forkJoin, from, iif, map, mergeMap, Observable, of, Subject, switchMap, tap } from 'rxjs';
import { FileUploadApiService } from '../../../utils/services/file-upload-api.service';
import { CardGameCoreService } from './card-game-core/card-game-core.service';
import { CardApiService } from './card-game-core/card-api.service';
import { isCardEditorCardDto } from '../utils/card-game-core.utils';
import { Style } from '../../style/models/style';
import { DndPosition } from '../../drag-and-drop/models/dnd-types';
import { CardFaceElementApiService } from './card-game-core/card-face-element-api.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
          cardFaceThumbnailFilePath: ''
        },
        cardFaceElementsPerCardFace: [
        ]
      },
      {
        cardFace: {
          cardFaceId: "-1",
          style: this.defaultCardEditorFaceStyle,
          cardFaceThumbnailFilePath: ''
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
            cardFaceThumbnailFilePath: ''
          },
          cardFaceElementsPerCardFace: [
          ]
        },
        {
          cardFace: {
            cardFaceId: "-1",
            style: this.defaultCardEditorFaceStyle,
            cardFaceThumbnailFilePath: ''
          },
          cardFaceElementsPerCardFace: []
        }
      ]
    };
  }

  setCardEditorCardDtoByCardId(cardId: string) {
    if (parseFloat(cardId) <= 0) {
      this.setBlankCardTemplate() ;
      this.reloadCurrentCardEditorCardFaceDto();
      this.setOnSetCardEditorCardDtoByCardId();
      return;
    }

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
      return of(undefined); // Return an observable that emits undefined
    }

    return this.fileUploadApiService.uploadFile$(cardFaceThumbnailImage, 'card-face').pipe(
      map((result: { id: string | undefined }) => {
        console.log('Upload card face thumbnail image result:', result);
        if (!result.id) return undefined;

        // Create the file metadata

        this.cardEditorCardDto.cardEditorCardFacesDto[cardFaceIndex].cardFace.cardFaceThumbnailFilePath = result.id;
        let cardFaceThumbnailFilePath = this.cardEditorCardDto.cardEditorCardFacesDto[cardFaceIndex].cardFace.cardFaceThumbnailFilePath;

        return cardFaceThumbnailFilePath;
      })
    );
  }

  // NOTE: This should be called whenever you upload an image
  // Again, returning it here should be fine, we're assignng the card face element content based on the return value anyways
  createCardFaceElementImage$(cardFaceElementImageId: string, cardFaceElementImage?: FormData
  ): Observable<string | undefined> {
    let cardFaceElementImageFilePath: string | undefined = this.getCurrentCardFaceElementsPerCardFace()
      .find(c => c.cardFaceElement.cardFaceElementId === cardFaceElementImageId)
      ?.cardFaceElement.cardFaceElementContent;

    if (cardFaceElementImage !== undefined) {
      return this.fileUploadApiService.uploadFile$(cardFaceElementImage, 'card-face-element-image').pipe(
        map((result: { id: string | undefined }) => {
          console.log('Upload card face element image result:', result);
          if (!result.id) return undefined;

          cardFaceElementImageFilePath = result.id;
          return cardFaceElementImageFilePath;
        })
      );
    }

    return of(cardFaceElementImageFilePath);
  }

  duplicateCardFaceElementImage$(cardFaceElementImageFilePath: string): Observable<string | undefined>
  {
    let guidPattern: RegExp = /^(?:\{{0,1}(?:[0-9a-fA-F]){8}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){12}\}{0,1})$/;

    // NOTE: This means that the element's image was already created
    // The bug occurs when you create from an already created image, but do not change the image element
    if (cardFaceElementImageFilePath !== undefined && cardFaceElementImageFilePath.match(guidPattern)) {
      return this.fileUploadApiService.replaceFilePath$(cardFaceElementImageFilePath, 'card-face-element-image'
      ).pipe(
        map((result: { id: string | undefined }) => {
          console.log('Replace card face element image result:', result);

          if (result.id) {
            cardFaceElementImageFilePath = result.id;
          }
          return cardFaceElementImageFilePath;
        })
      );
    }

    return of(cardFaceElementImageFilePath);
  }

  duplicateCardFaceElementImages$(): Observable<void> {
    let observables: Array<Observable<string | undefined>> = [];
    let elements: CardFaceElementPerCardFace[] = [];

    this.cardEditorCardDto.cardEditorCardFacesDto.forEach((cardEditorCardFaceDto: CardEditorCardFaceDto) => {
      cardEditorCardFaceDto.cardFaceElementsPerCardFace
        .filter(cardFaceElementPerCardFace =>
          cardFaceElementPerCardFace.cardFaceElement.cardFaceElementType === "image" && cardFaceElementPerCardFace.cardFaceElement.cardFaceElementId.match(/^\d{17,19}$/)           // NOTE: This means that the card face image element hasn't actually been created yet and therefore doesn't have a Snowflake ID, there's no point of duplicating
        )
        .forEach(cardFaceElementPerCardFace => {
          observables.push(
            this.duplicateCardFaceElementImage$(cardFaceElementPerCardFace.cardFaceElement.cardFaceElementContent)
              .pipe(takeUntilDestroyed(this.destroyRef))
          );
          elements.push(cardFaceElementPerCardFace);
        });
    });

    return forkJoin(observables).pipe(
      map((results: Array<string | undefined>) => {
        results.forEach((result, idx) => {
          if (result) {
            elements[idx].cardFaceElement.cardFaceElementContent = result;
          }
        });
        return; // Emit void to signal completion
      }),
      takeUntilDestroyed(this.destroyRef)
    );
  }

  replaceCardFaceElementImage$(
    cardFaceElementPerCardFace: CardFaceElementPerCardFace
  ): Observable<{ id: string | undefined }> {
    let element = cardFaceElementPerCardFace.cardFaceElement;
    
    if (element.cardFaceElementType !== 'image') {
      return of({ id: undefined });
    }

    let guidPattern: RegExp = /^(?:\{{0,1}(?:[0-9a-fA-F]){8}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){12}\}{0,1})$/;

    // NOTE: Guard clausing against element type but also if it matches the pattern, that means that its content never changed
    if (element.cardFaceElementContent.match(guidPattern)) {
      return of({ id: element.cardFaceElementContent });
    } // CHECKME: Should return the content, right?
  
    let newFile: string = element.cardFaceElementContent;
  
    return this.cardFaceElementApiService
      .getCardFaceElement$(element.cardFaceElementId)
      .pipe(
        catchError(err => {
          // NOTE: Treat this as undefined so that we can continue and upload the new file
          return of(undefined);
        }),
        switchMap((result: CardFaceElement | undefined) =>
          this.getImageFormData$(newFile).pipe(
            switchMap(formData => {
              if (!formData) {
                console.log(`No form data.`);
                return of({ id: undefined });
              }
  
              // CHECKME: Do we put || parseFloat(this.cardEditorCardDto.card.cardId) > 0
              if (!result) {
                // NOTE: For adding on image elements after updating: upload as new file
                console.log(`Replace Card Face Element Image: No existing image element`);
                return this.fileUploadApiService.uploadFile$(formData, 'card-face-element-image');
              } 
              else {
                console.log(`Replace Card Face Element Image: Existing image element`);
                let fileName: string = result.cardFaceElementContent;
                return this.fileUploadApiService.replaceFile(formData, fileName, 'card-face-element-image');
              }
            })
          )
        ),
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

  // TODO: Create a function to get all text content, convert them to BB Code then save them

  createCard(): void {
    // FIXME:
    /* 
    message": "An error occurred while processing the request",
    "error": "Item: Card Face Element\nFunction: Create Nav Async\nThe CardFaceElement property of CardFaceElementPerCardFace has already been made. (Parameter 'nav')"

    When running CreateCardEditorCardDto on already existing card, this should not be the case
    */

    // https://stackoverflow.com/questions/51860068/rxjs-6-conditionally-pipe-an-observable
    // https://www.learnrxjs.io/learn-rxjs/operators/conditional/iif

    // Conditionally returns one observable or another, and you can then chain your API cal
    let isDuplicate: boolean = parseFloat(this.cardEditorCardDto.card.cardId) > 0;

    iif(
      () => isDuplicate,
      this.duplicateCardFaceElementImages$(),
      of(undefined)
    )
    .pipe(
      switchMap(() =>this.cardApiService.createCardEditorCardDto$(this.cardEditorCardDto)),
      takeUntilDestroyed(this.destroyRef)
    )
    .subscribe({
      next: (createResult: CardEditorCardDto | undefined) => {
        if (isCardEditorCardDto(createResult)) {
          this.cardEditorCardDto = createResult;

          this.reloadCurrentCardEditorCardFaceDto();
          this.setOnCreateCard();

          this.cardGameCoreService.setOnCreateCardEditorCardDto(this.cardEditorCardDto);

          // Because we're making a duplicate, you don't want to store the card face elements to delete, only do it for saving
          if (isDuplicate) {
            this.cardFaceElementsPerCardFaceDelete = [];
          }
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

            this.cardGameCoreService.setOnUpdateCardEditorCardDto(this.cardEditorCardDto);
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

    this.cardApiService.deleteCardEditorCardDto$(cardId).subscribe((result: void | undefined) => {
        this.cardGameCoreService.setOnDeleteCardEditorCardDto(cardId);
    });
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
