import { effect, inject, Injectable } from '@angular/core';
import { CardEditorCardFaceDto, CardFace } from '../models/card-face';
import { CardEditorCardDto } from '../models/card';
import { CardFaceElementPerCardFace } from '../models/card-face-element';
import { catchError, concatMap, forkJoin, from, map, mergeMap, Observable, of, Subject, switchMap, tap } from 'rxjs';
import { FileUploadApiService } from '../../../utils/services/file-upload-api.service';
import { CardGameCoreService } from './card-game-core/card-game-core.service';
import { CardApiService } from './card-game-core/card-api.service';
import { isCardEditorCardDto } from '../utils/card-game-core.utils';
import { Style } from '../../style/models/style';
import { DndPosition } from '../../drag-and-drop/models/dnd-types';

@Injectable({
  providedIn: 'root'
})
export class CardEditorPreviewService {
  private readonly cardGameCoreService: CardGameCoreService = inject(CardGameCoreService);
  private readonly cardApiService: CardApiService = inject(CardApiService);
  private readonly fileUploadApiService = inject(FileUploadApiService);
  
  defaultCardEditorFaceStyle: Style = {
    styleId: 0,
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
      cardId: 0,
      currentCardFaceIndex: 0,
      cardName: ''
    },
    ownerId: '5811e387-1551-4090-9485-a3ebe30efb5a',
    cardEditorCardFacesDto: [
      {
        cardFace: {
          cardFaceId: 0,
          style: this.defaultCardEditorFaceStyle,
          cardFaceThumbnailFilePath: ''
        },
        cardFaceElementsPerCardFace: [
        ]
      },
      {
        cardFace: {
          cardFaceId: -1,
          style: this.defaultCardEditorFaceStyle,
          cardFaceThumbnailFilePath: ''
        },
        cardFaceElementsPerCardFace: []
      }
    ]
  };

  currentCardEditorCardFaceDto: CardEditorCardFaceDto = {
    cardFace: {
      cardFaceId: 0,
      style: {
        styleId: 0
      }
    },
    cardFaceElementsPerCardFace: []
  };

  cardFaceImages: FormData[] = [];

  private onFlip$$: Subject<void> = new Subject<void>();
  onFlip$: Observable<void> = this.onFlip$$.asObservable();

  private onCreateCard$$: Subject<void> = new Subject<void>();
  onCreateCard$: Observable<void> = this.onCreateCard$$.asObservable();

  private onCreateCardFaceElementPerCardFace$$: Subject<{type: string, dndPosition: DndPosition}> = new Subject<{type: string, dndPosition: DndPosition}>();
  onCreateCardFaceElementPerCardFace$: Observable<{type: string, dndPosition: DndPosition}> = this.onCreateCardFaceElementPerCardFace$$.asObservable();

  // NOTE: For when clicking on a blank card template
  setBlankCardTemplate() {
    this.cardEditorCardDto = {
      card: {
        cardId: 0,
        currentCardFaceIndex: 0,
        cardName: ''
      },
      ownerId: '5811e387-1551-4090-9485-a3ebe30efb5a',
      cardEditorCardFacesDto: [
        {
          cardFace: {
            cardFaceId: 0,
            style: this.defaultCardEditorFaceStyle,
            cardFaceThumbnailFilePath: ''
          },
          cardFaceElementsPerCardFace: [
          ]
        },
        {
          cardFace: {
            cardFaceId: -1,
            style: this.defaultCardEditorFaceStyle,
            cardFaceThumbnailFilePath: ''
          },
          cardFaceElementsPerCardFace: []
        }
      ]
    };
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

  constructor() {
    // this.setBlankCardTemplate();
    this.setCurrentCardEditorCardFaceDto();

    effect(() => {
      if (this.cardGameCoreService.cardEditorCardDto().card.cardId !== undefined && this.cardGameCoreService.cardEditorCardDto().card.cardId as number > 0) {
        this.setCardEditorCardDto(this.cardGameCoreService.cardEditorCardDto());      
        this.setCurrentCardEditorCardFaceDto();
      }
    });
  }

  isNewCardEditorCardDto(): boolean {
    return this.cardEditorCardDto.card.cardId <= 0;
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
    if (!newCardEditorCardDto || newCardEditorCardDto.card.cardId === undefined || newCardEditorCardDto.card.cardId < 0) return;
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

  private updateCardFacesThumbnailImages$(cardFaceImages: FormData[]): Observable<CardEditorCardDto> {
      // Wrap the promise in an observable if needed
      // TODO: We eventually want to actually use this to have more than 2 faces
      console.log(`Update card face thumbnail images - card face images: ${cardFaceImages}`);

      if (cardFaceImages.length <= 0) {
        return of(this.cardEditorCardDto);
      }
      
      let uploadCardFaceImages$ = cardFaceImages.map((formData: FormData) =>
        this.fileUploadApiService.uploadFile(formData, 'card-face')
      );
  
      // TODO: Replace the fork join with cardFacesFormData
      return forkJoin(uploadCardFaceImages$).pipe(
        tap((results: { id: string }[]) => {
          // Map each result to the corresponding DTO
          console.log(`Update card face images observable: ${JSON.stringify(results)}`);

          results.forEach((result, index) => {
            this.cardEditorCardDto.cardEditorCardFacesDto[index].cardFace.cardFaceThumbnailFilePath =
              result.id;
          });
        }),
        map(() => this.cardEditorCardDto)
      );
  
      // https://rxjs.dev/api/operators/tap
    }

  // TODO: From card face elements per card face
  updateCurrentCardFaceElementsPerCardFace(currentCardFaceElementsPerCardFace: CardFaceElementPerCardFace[]) {
    // console.log(`Update card face elements per card face: ${JSON.stringify(this.currentCardFaceElementsPerCardFace)}`);
    this.cardEditorCardDto.cardEditorCardFacesDto[this.getCurrentCardFaceIndex()].cardFaceElementsPerCardFace = currentCardFaceElementsPerCardFace;
  }


  uploadCardFaceElementsImagesAndUpdatePaths$(cardFaceElementsPerFace: CardFaceElementPerCardFace[]): Observable<CardEditorCardDto> {
      if (cardFaceElementsPerFace.length <=0) {
        return of(this.cardEditorCardDto);
      }
  
      // Question is is this mutable, or is there something going on with the asynchronous
      // FIXME: Why is this out of order?
      let imageElementIndexes: number[] = cardFaceElementsPerFace
        .map((el: CardFaceElementPerCardFace, idx: number) =>
          el.cardFaceElement.cardFaceElementType === 'image' ? idx : -1
        )
        .filter(idx => idx !== -1);
  
      // Create array preserving original indexes
      let imageElementsWithIndexes = imageElementIndexes.map(idx => ({
        element: cardFaceElementsPerFace[idx],
       originalCardFaceElementId: cardFaceElementsPerFace[idx].cardFaceElement.cardFaceElementId
      }));
  
      // Sort by ID while keeping original indexes
      imageElementsWithIndexes.sort((a, b) =>
        a.element.cardFaceElement.cardFaceElementId -
        b.element.cardFaceElement.cardFaceElementId
      );
  
      // Extract sorted elements for upload
      let sortedImageElements = imageElementsWithIndexes.map(x => x.element);
      let cardFaceElementsImages$ = this.uploadCardFaceElementsImages$(sortedImageElements);
  
      if (cardFaceElementsImages$) {
        return forkJoin(cardFaceElementsImages$).pipe(
          tap((cardFaceElementsImages: { id: string | undefined }[]) => {
            cardFaceElementsImages.forEach((dto, uploadIdx) => {
              if (dto.id) {
                // Use the preserved original index from sorted array
                let originalId= imageElementsWithIndexes[uploadIdx].originalCardFaceElementId;
                
                this.updateCardFaceElementsImagesFilePath(
                  cardFaceElementsPerFace,
                  originalId,
                  dto.id
                );
              }
            });
          }),
          map(() => this.cardEditorCardDto),
          catchError((err) => {
            console.error('Error uploading card face element images:', err);
            return of(this.cardEditorCardDto);
          })
        );
      }
    
      console.warn('No cardFaceElementsImages to upload');
      return of(this.cardEditorCardDto); // safer than null
    }
    
    // FIXME: This isn't ever going to actually update the correct images because cardFaceElementsPerFace have more elements than what's being passed in.
    updateCardFaceElementsImagesFilePath(cardFaceElementsPerFace: CardFaceElementPerCardFace[], originalCardFaceElementId: number, filePath: string) {
      // console.log(`Update card face elements images file path: ${JSON.stringify(cardFaceElementsPerFace)}`);
      
      let targetElement = cardFaceElementsPerFace.find(element => 
        element.cardFaceElement.cardFaceElementId === originalCardFaceElementId
      );
    
      // Update if found and is image type
      if (targetElement && targetElement.cardFaceElement.cardFaceElementType === 'image') {
        targetElement.cardFaceElement.cardFaceElementContent = filePath;
      }
    }
    
    uploadCardFaceElementsImages$(cardFaceElementsPerFace: CardFaceElementPerCardFace[]): Observable<{
      id: string | undefined;
    }>[] | undefined {
      let cardFaceElementsImages$: Observable<{
        id: string | undefined;
      }>[] = [];
    
      if (cardFaceElementsPerFace === undefined)
        return [];
      
      cardFaceElementsPerFace.forEach((dto)=> {
        cardFaceElementsImages$.push(this.uploadCardFaceElementImage$(dto as CardFaceElementPerCardFace));
      });
    
      // console.log(`Added to cardFaceElementsImages$`);
    
      return cardFaceElementsImages$;
    }
    // TODO:
    // https://stackoverflow.com/questions/35676451/observable-forkjoin-and-array-argument
    // Upload the card face elements image files in parallel
    uploadCardFaceElementImage$(cardFaceElementPerCardFace: CardFaceElementPerCardFace): Observable<{
      id: string | undefined;
    }> {
      if (cardFaceElementPerCardFace.cardFaceElement.cardFaceElementType !== 'image')
        return of({ id: undefined });
  
      // CHECKME: Is this correct?
      let content: string = cardFaceElementPerCardFace.cardFaceElement.cardFaceElementContent;
  
      // let dataUrl: string = cardFaceElementPerCardFace.cardFaceElement?.cardFaceElementContent.replace(/^data:image\/\w+;base64,/, '');
  
      // https://stackoverflow.com/questions/11876175/how-to-get-a-file-or-blob-from-an-object-url
      // let blob = await fetch(url).then(r => r.blob());
      // Handle blob: URL
  
      // TODO: Have a message showing that the element image faces are too big and don't create if that's the case
      if (content.startsWith('blob:') || content.endsWith('.png')) {
        return from(fetch(content).then(res => res.blob())).pipe(
          switchMap(blob => {
            let formData = new FormData();
            formData.append('formFile', blob);
  
            console.log(`Card face element image blob: ${blob.text()}`);
  
            return this.fileUploadApiService.uploadFile(formData, 'card-face-element-image');
          })
        );
      }
  
      // Handle data: URL (base64)
      if (content.startsWith('data:image/')) {
        let base64 = content.replace(/^data:image\/\w+;base64,/, '');
        let byteString = atob(base64);
        let arrayBuffer = new ArrayBuffer(byteString.length);
        let intArray = new Uint8Array(arrayBuffer);
  
        for (let i = 0; i < byteString.length; i++) {
          intArray[i] = byteString.charCodeAt(i);
        }
  
        let blob = new Blob([intArray], { type: 'image/png' });
        let formData = new FormData();
        formData.append('formFile', blob);
  
        console.log(`Card face element image data url: ${blob.text()}`);
        return this.fileUploadApiService.uploadFile(formData, 'card-face-element-image');
      }
  
      return of({ id: undefined });
    }




  private processAllCardFaces$(cardEditorCardDto: CardEditorCardDto) {
    return forkJoin(
      cardEditorCardDto.cardEditorCardFacesDto.map(face =>
        this.uploadCardFaceElementsImagesAndUpdatePaths$(face.cardFaceElementsPerCardFace)
          .pipe(tap(() => console.log('Done uploading face',)),map(() => cardEditorCardDto))
      )
    ).pipe(tap(() => console.log('All faces processed')), map(() => cardEditorCardDto));
  }

  // TODO: Create a function to get all text content, convert them to BB Code then save them

  createCard(): void {
    // ASSUMPTION: Always gotta have front face's image, and we might never flip
    // FIXME: Problem is the below isn't going to run if there's no card face images
    // this.updateCardFaceImages$(0);

    // TODO: Try to make the this.uploadCardFaceElementsImagesAndUpdatePaths$ functions run simultaneously
    // Order of operations:
    // 1. this.updateCardFacesThumbnailImages$
    // 2. this.uploadCardFaceElementsImagesAndUpdatePaths$
    // 3. this.cardApiService.createCardEditorCardDto$(this.cardEditorCardDto) (waits for the other two to finish)

    // https://blog.angular-university.io/rxjs-higher-order-mapping/
    this.updateCardFacesThumbnailImages$(this.cardFaceImages)
      .pipe(
        // mergeMap((cardEditorCardDto: CardEditorCardDto) => this.processAllCardFaces$(cardEditorCardDto)), // TODO: Replace the below with this
        mergeMap((cardEditorCardDto: CardEditorCardDto) => this.uploadCardFaceElementsImagesAndUpdatePaths$(cardEditorCardDto.cardEditorCardFacesDto[0].cardFaceElementsPerCardFace)), 
        mergeMap((cardEditorCardDto: CardEditorCardDto) => this.uploadCardFaceElementsImagesAndUpdatePaths$(cardEditorCardDto.cardEditorCardFacesDto[1].cardFaceElementsPerCardFace)), 
        concatMap((cardEditorCardDto: CardEditorCardDto) => this.cardApiService.createCardEditorCardDto$(cardEditorCardDto)), // NOTE: Need to return an actual value
      )
      .subscribe({
        next: (createResult: CardEditorCardDto | undefined) => {
          // console.log('Card successfully created:', createResult);

          if (isCardEditorCardDto(createResult)) {
            this.cardEditorCardDto = createResult;

            this.reloadCurrentCardEditorCardFaceDto();
            this.setOnCreateCard();


            // NOTE: For updating the card collection immediately
            // ASSUMPTION: You can only create a card as a user,, or save a new card from a card in the room for that user
            this.cardGameCoreService.onCreateCardEditorCardDto(this.cardEditorCardDto);
          }
        },
        error: (err) => {
          console.error('Something went wrong:', err);
        }
      }
      );
  }

  reloadCurrentCardEditorCardFaceDto() {
    this.currentCardEditorCardFaceDto = this.cardEditorCardDto.cardEditorCardFacesDto[this.getCurrentCardFaceIndex()];
  }

  setOnCreateCard() {
    this.onCreateCard$$.next();
  }

  updateCurrentCardFaceStyle(currentCardFaceStyle: Style) {
    this.currentCardEditorCardFaceDto.cardFace.style = currentCardFaceStyle;
  }
}
