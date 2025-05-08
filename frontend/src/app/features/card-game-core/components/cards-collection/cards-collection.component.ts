import { Component, effect, inject, input, InputSignal, output, OutputEmitterRef } from '@angular/core';
import { Card, CardEditorCardDto, CardPositionPerRoom } from '../../models/card';
import { CardApiService } from '../../services/card-game-core/card-api.service';
import { CardComponent } from '../card/card.component';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDragMove, DragDropModule } from '@angular/cdk/drag-drop';
import { catchError, map, Observable, of } from 'rxjs';
import { DndPosition } from '../../../drag-and-drop/models/dnd-types';
import { CardGameCoreService } from '../../services/card-game-core/card-game-core.service';
import { isCard } from '../../utils/card-game-core.utils';
import { DndBoardService } from '../../../drag-and-drop/services/dnd-board.service';

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

  onDragDrop(event: CdkDragDrop<any[]>, item: any) {
    if (!event.isPointerOverContainer && isCard(item)) {
      this.cardApiService.getCardEditorCardDto$(item.cardId).subscribe((result: CardEditorCardDto | undefined) => {
        if (result === undefined)
          return;

        // NOTE: Cards in rooms should not have an owner
        let cardEditorCardDto: CardEditorCardDto = result;
        cardEditorCardDto.ownerId = '';

        this.cardApiService.createCardEditorCardDtoForGameRoomFromExistingDto$(cardEditorCardDto).subscribe((result: CardEditorCardDto | undefined) => {
          if (result === undefined)
            return;

          // TODO: Refactor later, this isn't optimal
          let mouseAUCoordinates = this.dndBoardService.getMouseAUCoordinates();

          let dndPosition: {
            gridX: number;
            gridY: number;
          } = mouseAUCoordinates;

          let cpr: CardPositionPerRoom = {
            cardPositionPerRoomId: 0,
            card: result.card as Card,
            dndItem: {
              dndItemId: 0,
              isDraggable: false,
              isDroppable: false
            },
            dndPosition: {
              dndPositionId: 0, x: dndPosition.gridX, y: dndPosition.gridY} as DndPosition, // NOTE: Pass it as a gr id coordinate here, then convert it back into screen coordinates
            gameRoom: {
              gameRoomId: 1
            }
          };
    
          this.createCardPositionPerRoom(cpr);
          
          // console.log("Is outside the cards collection menu");
        })
      })
    }

    // console.log(`Previous Container: ${event.previousContainer}, Container: ${event.container}, Is point over container: ${event.isPointerOverContainer}, Drop point: ${JSON.stringify(event.dropPoint)}, Mouse position: ${JSON.stringify(this.mousePosition)}`);
  }

  private createCardPositionPerRoom(cpr: CardPositionPerRoom) {
    this.cardGameCoreService.createCardPositionPerRoom(cpr);
  }

  // TODO: Refactor, use the gameRoomService here and the cardPositionPerRoomApiService here instead, pass in the item index for the subject to then communicate with the DndBoard
}
