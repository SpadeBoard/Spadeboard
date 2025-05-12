import { Component, effect, inject, input, InputSignal, output, OutputEmitterRef } from '@angular/core';
import { Card, CardEditorCardDto, CardPositionPerRoom } from '../../models/card';
import { CardApiService } from '../../services/card-game-core/card-api.service';
import { CardComponent } from '../card/card.component';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDragMove, DragDropModule } from '@angular/cdk/drag-drop';
import { catchError, forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';
import { DndPosition } from '../../../drag-and-drop/models/dnd-types';
import { CardGameCoreService } from '../../services/card-game-core/card-game-core.service';
import { isCard } from '../../utils/card-game-core.utils';
import { DndBoardService } from '../../../drag-and-drop/services/dnd-board.service';
import { CardEditorCardFaceDto } from '../../models/card-face';
import { FileUploadApiService } from '../../../../utils/services/file-upload-api.service';
import { CardFaceElementPerCardFace } from '../../models/card-face-element';

@Component({
  selector: 'app-cards-collection',
  imports: [ 
    CardComponent,
    CdkDrag, CdkDragHandle, DragDropModule
  ],
  templateUrl: './cards-collection.component.html',
  styleUrl: './cards-collection.component.css'
})
export class CardsCollectionComponent {
  private userId: string = "5811e387-1551-4090-9485-a3ebe30efb5a";
  
  private mousePosition = { x: 0, y: 0 };

  cardGameCoreService: CardGameCoreService = inject(CardGameCoreService);
  private cardApiService: CardApiService = inject(CardApiService);
  private dndBoardService: DndBoardService = inject(DndBoardService);

  private readonly fileUploadApiService = inject(FileUploadApiService);

  cards: Card[] =[];

  constructor() {
    // TODO: Might want to do a behavior subject instead where we get the latest card based on when we add the card
    effect(() => {
      if (this.cardGameCoreService.isCardsCollectionMenuOpen()) {
        this.populateCardsCollection();
      }

      if (this.cardGameCoreService.userId() !== '' || this.cardGameCoreService.userId() !== null) {
        this.userId = this.cardGameCoreService.userId();
      }
    });
  }

  ngOnInit() {
    this.onCreateCardEditorCardDto();
    this.onUpdateCardEditorCardDto();
  }
  
  getCards(): void {
    this.cardApiService.getCards$(
      this.userId).subscribe((result: Card[] | undefined) => {
        if (result !== undefined)
        {
          this.cards = result.filter(card => !card.isTemplate);
          return;
        }
    });
  }

  // https://v17.angular.io/guide/observables
  // https://rxjs.dev/api/operators/catchError
  // https://angular.dev/guide/templates/pipes

  // TODO: Make a component for the cards menu, and what we wanna do
    // is if the amount of cards is less than the amount of cards in the database for this user
    // We'd then grab that new card at that index, and then add it onto the cards
  private populateCardsCollection() {
    if (this.cards.length <= 0) {
      this.getCards();
      // console.log(`On cards: ${JSON.stringify(this.cards)}`);
    }
  }

  /* 
  Potential Issues / Considerations
  Only adds one card per call:
  If the server has many new cards, you’ll need to call onCreateCardEditorCardDto() repeatedly (or use a loop/recursion) to fully sync.
  */
  private onCreateCardEditorCardDto() {
    // ASSUMPTION:
    // It's possible for cards collection to already have cards before adding the new card, i.e., cards you've made before and now are having a new session
    // You might create a new card before opening menu, so without this check, then you'd only ever add the new card that's just created, not loading all of the cards at your dispersal
    this.cardGameCoreService.onCreateCardEditorCardDto$.subscribe((cardEditorCardDto: CardEditorCardDto) => {
      if (cardEditorCardDto && this.cards.length > 0 && !cardEditorCardDto.card.isTemplate) {
        this.cards.push(cardEditorCardDto.card);
        return;
      }

      this.populateCardsCollection();
    });
  }

  private onUpdateCardEditorCardDto() {
    // ASSUMPTION:
    // It's possible for cards collection to already have cards before adding the new card, i.e., cards you've made before and now are having a new session
    // You might create a new card before opening menu, so without this check, then you'd only ever add the new card that's just created, not loading all of the cards at your dispersal
    this.cardGameCoreService.onUpdateCardEditorCardDto$.subscribe((cardEditorCardDto: CardEditorCardDto) => {
      if (cardEditorCardDto && this.cards.length > 0 && !cardEditorCardDto.card.isTemplate) {
        let index = this.cards.findIndex(card => card.cardId === cardEditorCardDto.card.cardId);

        if (index !== -1) {
          this.cards[index] = cardEditorCardDto.card;
        }
      }
    });
  }

  onDragMoved(event: CdkDragMove) {
    this.mousePosition = event.pointerPosition;
  }

  replaceAllImageFilePaths(cardEditorCardDto: CardEditorCardDto): Observable<any> {
    let allReplacements$: Observable<any>[] = [];
     let guidPattern: RegExp = /^(?:\{{0,1}(?:[0-9a-fA-F]){8}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){12}\}{0,1})$/;

    cardEditorCardDto.cardEditorCardFacesDto.forEach((cardEditorCardFaceDto: CardEditorCardFaceDto) => {
      let cardFaceImageFilePath: string = cardEditorCardFaceDto.cardFace.cardFaceThumbnailFilePath as string;

      if (cardFaceImageFilePath.match(guidPattern)) {
        let thumbnailReplacement$ = this.fileUploadApiService.replaceFilePath$(cardFaceImageFilePath, 'card-face')
          .pipe(
            tap((result: { id: string | undefined }) => {
              if (result.id !== undefined) {
                cardEditorCardFaceDto.cardFace.cardFaceThumbnailFilePath = result.id;
              }
            })
          );

        allReplacements$.push(thumbnailReplacement$);
      }

      // Replace each card face element image file path
      cardEditorCardFaceDto.cardFaceElementsPerCardFace.forEach((cardFaceElementPerCardFace: CardFaceElementPerCardFace) => {
        if (cardFaceElementPerCardFace.cardFaceElement.cardFaceElementType === "image") {
          let filePath: string = cardFaceElementPerCardFace.cardFaceElement.cardFaceElementContent;

          // NOTE: This is to make sure it doesn't attempt to copy the placeholder image if for some reason you added an image element but didn't upload an image
          if (filePath.match(guidPattern)) {
            let elementImageReplacement$ = this.fileUploadApiService.replaceFilePath$(filePath, 'card-face-element-image')
              .pipe(
                tap((result: { id: string | undefined }) => {
                  if (result.id !== undefined) {
                    cardFaceElementPerCardFace.cardFaceElement.cardFaceElementContent = result.id;
                  }
                })
              );
            allReplacements$.push(elementImageReplacement$);
          }
        }
      });
    });

    return forkJoin(allReplacements$);
  }

  onDragDrop(event: CdkDragDrop<any[]>, item: any) {
    if (!event.isPointerOverContainer && isCard(item)) {
      this.cardApiService.getCardEditorCardDto$(item.cardId).subscribe((result: CardEditorCardDto | undefined) => {
        if (result === undefined)
          return;

        // TODO: For every face in result, we want to replace the file path, this should be a forkJoin, which then pipes and switch maps to replace the file path for all elements that are images

        // NOTE: Cards in rooms should not have an owner
        let cardEditorCardDto: CardEditorCardDto = result;
        cardEditorCardDto.ownerId = '';

        this.replaceAllImageFilePaths(cardEditorCardDto)
          .pipe(
            switchMap(() =>
              this.cardApiService.createCardEditorCardDtoForGameRoomFromExistingDto$(cardEditorCardDto)
            )
          ).subscribe({
            next: (result: CardEditorCardDto | undefined) => {
              if (result === undefined)
                return;

              // TODO: Refactor later, this isn't optimal
              let mouseAUCoordinates = this.dndBoardService.getMouseAUCoordinates();

              let dndPosition: {
                gridX: number;
                gridY: number;
              } = mouseAUCoordinates;

              let cpr: CardPositionPerRoom = {
                cardPositionPerRoomId: "0",
                card: result.card as Card,
                dndItem: {
                  dndItemId: "0",
                  isDraggable: false,
                  isDroppable: false
                },
                dndPosition: {
                  dndPositionId: "0", x: dndPosition.gridX, y: dndPosition.gridY
                } as DndPosition, // NOTE: Pass it as a gr id coordinate here, then convert it back into screen coordinates
                gameRoom: {
                  gameRoomId: "1"
                }
              };

              this.createCardPositionPerRoom(cpr);

              console.log('All image file paths replaced!');
            },
            error: (err) => {
              // Handle error
              console.error('Error replacing image file paths:', err);
            }
          });
      })
    }

    // console.log(`Previous Container: ${event.previousContainer}, Container: ${event.container}, Is point over container: ${event.isPointerOverContainer}, Drop point: ${JSON.stringify(event.dropPoint)}, Mouse position: ${JSON.stringify(this.mousePosition)}`);
  }

  private createCardPositionPerRoom(cpr: CardPositionPerRoom) {
    this.cardGameCoreService.createCardPositionPerRoom(cpr);
  }

  // TODO: Refactor, use the gameRoomService here and the cardPositionPerRoomApiService here instead, pass in the item index for the subject to then communicate with the DndBoard
}
