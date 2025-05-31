import { Component, DestroyRef, effect, ElementRef, HostListener, inject, input, InputSignal, output, OutputEmitterRef } from '@angular/core';
import { Card, CardEditorCardDto, CardPositionPerRoom } from '../../models/card';
import { CardApiService } from '../../services/card-game-core/card-api.service';
import { CardComponent } from '../card/card.component';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDragMove, DragDropModule } from '@angular/cdk/drag-drop';
import { catchError, forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';
import { DndPosition } from '../../../drag-and-drop/models/dnd-types';
import { CardGameCoreService } from '../../services/card-game-core/card-game-core.service';
import { isCard } from '../../utils/card-game-core.utils';
import { DndBoardService } from '../../../drag-and-drop/services/dnd-board.service';
import { FileUploadApiService } from '../../../../utils/services/file-upload-api.service';
import { ActionContextMenuComponent } from '../../../actions-context-menu/components/action-context-menu/action-context-menu/action-context-menu.component';
import { ActionContextMenuItem } from '../../../actions-context-menu/models/action-context-menu-item';
import { CardEditorPreviewService } from '../../services/card-editor-preview.service';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-cards-collection',
  imports: [ 
    CardComponent, CommonModule,
    CdkDrag, CdkDragHandle, DragDropModule, ActionContextMenuComponent
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
  private cardEditorPreviewService: CardEditorPreviewService = inject(CardEditorPreviewService);

  private readonly fileUploadApiService = inject(FileUploadApiService);

  private destroyRef: DestroyRef = inject(DestroyRef);

  cards: Card[] =[];

  private rightClickMenuPositionX: number = 0;
  private rightClickMenuPositionY: number = 0;
  currentContextMenuId: string = "";

  get actionContextMenuItems(): ActionContextMenuItem[] {
    return [{
      id: 0,
      name: 'Flip',
      action: (card?: Card) => {
        if (!card) return;

        let idx = this.cards.findIndex(c => c.cardId === card.cardId);
        if (idx !== -1) {
          this.cards[idx] = {
            ...card,
            currentCardFaceIndex: (card.currentCardFaceIndex === 0) ? 1 : 0
          };
        }
      },
      disabled: false
    },
     {
       id: 1,
       name: 'Edit Card',
       action: (card?: Card) => {
         if (!card) return;
         this.cardEditorPreviewService.getCardEditorCardDtoByCardId(card.cardId);
         this.cardGameCoreService.setIsCardEditorOpen(!this.cardGameCoreService.isCardEditorOpen());
       },
       disabled: false
     },
    {
      id: 2,
      name: 'Delete Card',
      action: (card?: Card) => {
        if (!card || card.cardId === this.cardEditorPreviewService.cardEditorCardDto.card.cardId) return;
        this.cardEditorPreviewService.deleteCard(card.cardId);
      },
       disabled: ((this.currentContextMenuId === this.cardEditorPreviewService.cardEditorCardDto.card.cardId)) ? true: false
    }
  ]};

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
    this.cardGameCoreService.onCreateCardEditorCardDto$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((cardEditorCardDto: CardEditorCardDto) => {
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
    this.cardGameCoreService.onUpdateCardEditorCardDto$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((cardEditorCardDto: CardEditorCardDto) => {
      if (cardEditorCardDto && this.cards.length > 0 && !cardEditorCardDto.card.isTemplate) {
        let index = this.cards.findIndex(card => card.cardId === cardEditorCardDto.card.cardId);

        if (index !== -1) {
          this.cards[index] = cardEditorCardDto.card;
        }
      }
    });
  }

  private onDeleteCardEditorCardDto() {
    this.cardGameCoreService.onDeleteCardEditorCardDto$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((cardId: string) => {
        this.cards = this.cards.filter(c => c.cardId !== cardId);
      });
  }

  onDragMoved(event: CdkDragMove) {
    this.mousePosition = event.pointerPosition;
  }

  replaceAllImageFilePaths$(cardEditorCardDto: CardEditorCardDto): Observable<any> {
    return forkJoin([
      this.cardEditorPreviewService.duplicateCardFaceElementImages$(cardEditorCardDto),
      this.cardEditorPreviewService.duplicateCardFaceThumbnails$(cardEditorCardDto)]).pipe(
        takeUntilDestroyed(this.destroyRef)
      );
  }

  onDragDrop(event: CdkDragDrop<any[]>, item: any) {
    if (!event.isPointerOverContainer && isCard(item)) {
      this.cardApiService.getCardEditorCardDtoByCardId$(item.cardId).subscribe((result: CardEditorCardDto | undefined) => {
        if (result === undefined)
          return;

        // TODO: For every face in result, we want to replace the file path, this should be a forkJoin, which then pipes and switch maps to replace the file path for all elements that are images

        // NOTE: Cards in rooms should not have an owner
        let cardEditorCardDto: CardEditorCardDto = result;
        cardEditorCardDto.ownerId = '';

        // TODO: Just remove the file paths and use the file metadata
        // You'd want to duplicate card face thumbnails because it's potentially possible for a thumbnail for one card to be marked as orphan while it's still being used by something else
        this.replaceAllImageFilePaths$(cardEditorCardDto).pipe(
          switchMap((value: any | undefined) => this.cardApiService.createCardEditorCardDto$(cardEditorCardDto)),
          takeUntilDestroyed(this.destroyRef)
        ).subscribe({
          next: (result: CardEditorCardDto | undefined) => {
            if (result === undefined) return;

            let mouseAUCoordinates = this.dndBoardService.getMouseAUCoordinates();
            let dndPosition = mouseAUCoordinates;

            let cpr: CardPositionPerRoom = {
              cardPositionPerRoomId: "0",
              card: result.card as Card,
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
                autosaveInterval: 30000
              },
            };

            this.createCardPositionPerRoom(cpr);

            console.log('All image file paths replaced!');
          },
          error: (err) => {
            console.error('Error replacing image file paths:', err);
          }
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
    let cardCenterX: number = cardRect.left + cardRect.width / 2;
    let cardCenterY: number = cardRect.top + cardRect.height / 2;

    this.rightClickMenuPositionX = cardCenterX;
    this.rightClickMenuPositionY = cardCenterY;
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
      left: `${this.rightClickMenuPositionX}px`,
      top: `${this.rightClickMenuPositionY}px`
    }
  }

  handleActionContextMenuItemClick(item: ActionContextMenuItem) {
    let card: Card | undefined = this.cards.find(c => c.cardId === this.currentContextMenuId);

    if (card)
      item.action(card);
  }

  // TODO: Refactor, use the gameRoomService here and the cardPositionPerRoomApiService here instead, pass in the item index for the subject to then communicate with the DndBoard
}
