import { CdkDrag, CdkDragDrop, CdkDragMove, DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, effect, HostListener, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Coordinates, getMidpoint } from '../../../../utils/utils';
import { ActionContextMenuComponent } from '../../../actions-context-menu/components/action-context-menu/action-context-menu/action-context-menu.component';
import { ActionContextMenuItem } from '../../../actions-context-menu/models/action-context-menu-item';
import { DndPosition } from '../../../drag-and-drop/models/dnd-types';
import { DndBoardService } from '../../../drag-and-drop/services/dnd-board.service';
import { Card, CardEditorCardDto, CardPositionPerRoom } from '../../models/card';
import { CardEditorPreviewService } from '../../services/card-editor-preview.service';
import { CardApiService } from '../../services/card-game-core/api/card-api.service';
import { CardGameCoreService } from '../../services/card-game-core/card-game-core.service';
import { isCard } from '../../utils/card-game-core.utils';
import { CardComponent } from '../card/card.component';
import { CardEditorCardDtoApiService } from '../../services/card-game-core/api/card-editor-card-dto-api.service';
import { DEFAULT_CARD_SCALE, getDeleteCard, getEditCard, getFlip } from '../../utils/card.constants';

@Component({
  selector: 'app-cards-collection',
  imports: [ 
    CardComponent, CommonModule,
    CdkDrag, DragDropModule, ActionContextMenuComponent
  ],
  templateUrl: './cards-collection.component.html',
  styleUrl: './cards-collection.component.scss'
})
export class CardsCollectionComponent {
  private userId: string = "5811e387-1551-4090-9485-a3ebe30efb5a";
  
  private mousePosition = { x: 0, y: 0 };

  cardGameCoreService: CardGameCoreService = inject(CardGameCoreService);
  private readonly cardApiService: CardApiService = inject(CardApiService);
  private readonly cardEditorCardDtoApiService: CardEditorCardDtoApiService = inject(CardEditorCardDtoApiService);
  private readonly dndBoardService: DndBoardService = inject(DndBoardService);
  private readonly cardEditorPreviewService: CardEditorPreviewService = inject(CardEditorPreviewService);

  private destroyRef: DestroyRef = inject(DestroyRef);

  cards: Card[] =[];

  private contextMenuPosition: Coordinates = {
    x: 0,
    y: 0
  };

  currentContextMenuId: string = "";

  get actionContextMenuItems(): ActionContextMenuItem[] {
    return [
      getFlip(),
      getEditCard(),
      getDeleteCard(this.currentContextMenuId, this.cardEditorPreviewService)
    ]
  };

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
    this.onDeleteCardEditorCardDto();
  }
  
  getCards(): void {
    this.cardApiService.getCards$(
      this.userId).subscribe((result: Card[] | undefined) => {
        if (result !== undefined)
        {
          this.cards = result;
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
  private onCreateCardEditorCardDto(): void {
    // ASSUMPTION:
    // It's possible for cards collection to already have cards before adding the new card, i.e., cards you've made before and now are having a new session
    // You might create a new card before opening menu, so without this check, then you'd only ever add the new card that's just created, not loading all of the cards at your dispersal
    this.cardEditorPreviewService.onCreateCardEditorCardDto$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((cardEditorCardDto: CardEditorCardDto) => {
      if (cardEditorCardDto && this.cards.length > 0) {
        this.cards.push({...cardEditorCardDto.card});
        return;
      }

      this.populateCardsCollection();
    });
  }

  private onUpdateCardEditorCardDto(): void {
    // ASSUMPTION:
    // It's possible for cards collection to already have cards before adding the new card, i.e., cards you've made before and now are having a new session
    // You might create a new card before opening menu, so without this check, then you'd only ever add the new card that's just created, not loading all of the cards at your dispersal
    this.cardEditorPreviewService.onUpdateCardEditorCardDto$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((cardEditorCardDto: CardEditorCardDto) => {
      if (cardEditorCardDto && this.cards.length > 0) {
        let index = this.cards.findIndex(card => card.cardId === cardEditorCardDto.card.cardId);

        if (index !== -1) {
          this.cards[index] = {...cardEditorCardDto.card};
        }
      }
    });
  }

  private onDeleteCardEditorCardDto(): void {
    this.cardEditorPreviewService.onDeleteCardEditorCardDto$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((cardId: string) => {
        this.cards = this.cards.filter(c => c.cardId !== cardId);
      });
  }

  onDragMoved(event: CdkDragMove) {
    this.mousePosition = event.pointerPosition;
  }

  onDragDrop(event: CdkDragDrop<any[]>, item: any) {
    if (!event.isPointerOverContainer && isCard(item)) {
      this.cardEditorCardDtoApiService.getCardEditorCardDtoByCardId$(item.cardId).subscribe((result: CardEditorCardDto | undefined) => {
        if (result === undefined)
          return;

        // TODO: For every face in result, we want to replace the file path, this should be a forkJoin, which then pipes and switch maps to replace the file path for all elements that are images

        // NOTE: Cards in rooms should not have an owner
        let cardEditorCardDto: CardEditorCardDto = result;
        cardEditorCardDto.ownerId = '';

        this.cardEditorPreviewService.duplicateCard$(cardEditorCardDto).pipe(
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe((cardEditorCardDto: CardEditorCardDto | undefined) => {
          if (!cardEditorCardDto) return;

            let dndPosition: Coordinates = this.dndBoardService.mouseAUCoordinates;

            let cpr: CardPositionPerRoom = {
              cardPositionPerRoomId: "0",
              card: cardEditorCardDto.card as Card,
              dndItem: {
                dndItemId: "0",
                isDraggable: false,
                isDroppable: false,
                isRotatable: true
              },
              dndPosition: {
                dndPositionId: "0", x: dndPosition.x, y: dndPosition.y
              } as DndPosition,
              dndRotation: {
                dndRotationId: "0",
                degrees: 0
              },
              gameRoom: {
                gameRoomId: "1", // FIXME: Replace this with getting the actual current game room
                autosaveInterval: 30000,
                dndBoardSize: 1000
              },
              zIndex: isFinite(this.dndBoardService.globalZIndexCounter)
                ? this.dndBoardService.globalZIndexCounter++
                : (this.dndBoardService.globalZIndexCounter = 1, 0)
            };

            this.createCardPositionPerRoom(cpr);

            console.log('All image file paths replaced!');
        });
      })

      // console.log(`Previous Container: ${event.previousContainer}, Container: ${event.container}, Is point over container: ${event.isPointerOverContainer}, Drop point: ${JSON.stringify(event.dropPoint)}, Mouse position: ${JSON.stringify(this.mousePosition)}`);
    }
  }

  private createCardPositionPerRoom(cpr: CardPositionPerRoom) {
    this.cardGameCoreService.createCardPositionPerRoom(cpr);
  }

  onCardRightClick(event: MouseEvent, cardId: string): void {
    event.preventDefault();

    let cardElem: HTMLElement = event.currentTarget as HTMLElement;
    let cardRect: DOMRect = cardElem.getBoundingClientRect();

    // Center of the card in viewport coordinates
    let midpoint: Coordinates = getMidpoint(
      {
        x: cardRect.left,
        y: cardRect.top
      },
      {
        x: cardRect.width,
        y: cardRect.height
      }
    );

    this.contextMenuPosition = midpoint;

    this.currentContextMenuId = cardId;
  }


  @HostListener('document:click')
  documentClick(): void {
    this.currentContextMenuId = "";
  }

  // NOTE: Should be right considering it's not a child of the cards-menu
  getRightClickMenuStyle() {
    return {
      position: 'fixed',
      left: `${this.contextMenuPosition.x}px`,
      top: `${this.contextMenuPosition.y}px`
    }
  }

  handleActionContextMenuItemClick(item: ActionContextMenuItem) {
    let card: Card | undefined = this.cards.find(c => c.cardId === this.currentContextMenuId);

    if (!card) return;

    // CHECKME: Can we refactor this and make it something other than a switch statement? A dictionary if we really wanted to?
    switch (item.id) {
      case 0: 
        item.action({card: card, cards: this.cards});
        break;
      case 1:
        item.action({cardId: card.cardId, cardEditorPreviewService: this.cardEditorPreviewService, cardGameCoreService: this.cardGameCoreService});
        break;
      case 2:
        item.action({currentContextMenuId: this.currentContextMenuId, cardEditorPreviewService: this.cardEditorPreviewService});
        break;
      default:
        throw new Error("No default implementation for item");
    }
  }

  getDefaultCardScale(): number {
    return DEFAULT_CARD_SCALE;
  }

  // TODO: Refactor, use the gameRoomService here and the cardPositionPerRoomApiService here instead, pass in the item index for the subject to then communicate with the DndBoard
}
