import { CdkDrag, CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';

import { Component, DestroyRef, effect, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { ActionContextMenuItem } from '../../../../shared/actions/models/action-context-menu-item';
import { ActionContextMenuService } from '../../../../shared/actions/services/action-context-menu.service';
import { DndBoardService } from '../../../drag-and-drop/board/service/dnd-board.service';
import { UserService } from '../../../user/service/user.service';
import { CardEditorCardDto } from '../../card-editor/models/card-editor-card-dto';
import { CardEditorFacadeService } from '../../card-editor/services/facade/card-editor-facade.service';
import { CardEditorModalService } from '../../card-editor/services/modal/card-editor-modal.service';
import { CardComponent } from '../../card/components/core/card.component';
import { Card } from '../../card/models/card';
import { CardActionsService } from '../../card-actions/service/card-actions.service';
import { CardPositionPerRoomService } from '../../card-position-per-room/services/facade/card-position-per-room.service';
import { isCard } from '../../utils/card-game-core.utils';
import { DEFAULT_CARD_SCALE, getCardPositionPerRoom } from '../../utils/card.constants';
import { CardsCollectionService } from '../service/cards-collection.service';

@Component({
  selector: 'app-cards-collection',
  imports: [
    CardComponent,
    CdkDrag,
    DragDropModule
  ],
  templateUrl: './cards-collection.component.html',
  styleUrl: './cards-collection.component.scss'
})
export class CardsCollectionComponent {
  private readonly userService: UserService = inject<UserService>(UserService);

  private readonly cardEditorFacadeService: CardEditorFacadeService = inject<CardEditorFacadeService>(CardEditorFacadeService);

  protected readonly cardsCollectionService: CardsCollectionService = inject<CardsCollectionService>(CardsCollectionService);

  protected readonly cardPositionPerRoomService: CardPositionPerRoomService = inject<CardPositionPerRoomService>(CardPositionPerRoomService);

  private readonly dndBoardService: DndBoardService = inject<DndBoardService>(DndBoardService);

  private readonly cardEditorModalService: CardEditorModalService = inject<CardEditorModalService>(CardEditorModalService); // CHECKME: Remove this?

  private readonly cardActionsService: CardActionsService = inject<CardActionsService>(CardActionsService);
  
  private readonly destroyRef: DestroyRef = inject<DestroyRef>(DestroyRef);

  private readonly actionContextMenuService: ActionContextMenuService = inject<ActionContextMenuService>(ActionContextMenuService);

  protected cards: Card[] = [];

  protected currentContextCardId: string = "";

  protected actionContextMenuItems: ActionContextMenuItem[] = [];

  private actionContextMenuId: string = '';

  private cardEditorCardDtoOperations: Map<string, Function> = new Map<string, Function>([
    ['create', (cardEditorCardDto: CardEditorCardDto) => this.cardsCollectionService.addCard(this.cards, cardEditorCardDto, this.userService.$userId())],
    ['update', (cardEditorCardDto: CardEditorCardDto) => this.cardsCollectionService.updateCard(this.cards, cardEditorCardDto)],
    ['delete', (cardId: string) => this.cards = this.cardsCollectionService.deleteCard(this.cards, cardId)]
  ]);

  constructor() {
    this.cardEditorFacadeService.subscribeToCompletedOperations(this.cardEditorCardDtoOperations, this.destroyRef);

    // TODO: Might want to do a behavior subject instead where we get the latest card based on when we add the card
    effect(() => {
      if (this.cardsCollectionService.$isCardsCollectionMenuOpen()) this.cardsCollectionService.populateCardsCollection(this.userService.$userId(), this.cards);
    });
  }

  protected onDragDrop(event: CdkDragDrop<any[]>, item: any): void {
    if (!event.isPointerOverContainer && isCard(item)) {
      this.cardEditorFacadeService.getCardEditorCardDtoByCardId$(item.cardId)
      .pipe(
        switchMap((value: CardEditorCardDto | undefined) => {
          if (!value) throw new Error(`No CardEditorCardDto`);
          value.ownerId = '';

          return this.cardEditorFacadeService.duplicateCardEditorCardDto$(value, this.destroyRef)
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (cardEditorCardDto: CardEditorCardDto | undefined) => {
          if (!cardEditorCardDto) return;

          this.cardPositionPerRoomService.createdCardPositionPerRoom(getCardPositionPerRoom(cardEditorCardDto.card, this.dndBoardService.mouseAUCoordinates, this.dndBoardService.globalZIndexCounter));
        },
        error: console.error
      });
    }
  }

  // NOTE: 3 possibilities
  // 1. Current context card Id equals card ID and that the menu's already open
  // 2. If the menu doesn't exist ala no actionContextMenuId, then it creates a new context menu for the current card ID
  // 3. If the menu does exist and there's a newly assigned currentContextCardId, it updates the menu's style and items

  // We can assume that when the menu's closed, all IDs get reset
  protected onCardRightClick(event: MouseEvent, cardId: string): void {
    event.preventDefault();

    if (!cardId || this.currentContextCardId === cardId) return;

    this.currentContextCardId = cardId;

    this.setCollectionMenuItems();

    if (!this.actionContextMenuId) {
      this.actionContextMenuId = this.actionContextMenuService.open
        (
          this.actionContextMenuItems,
          (item: ActionContextMenuItem) => this.performAction(item),
          this.actionContextMenuService.getStyle
            (
              {
                x: event.clientX,
                y: event.clientY
              }
            ),
          () => this.onClosedActionContextMenu(),
        );
    }
    else {
      this.actionContextMenuService.setActionContextMenuItems(
        this.actionContextMenuId,
        this.actionContextMenuItems
      );

      this.actionContextMenuService.setStyle(
        this.actionContextMenuId,
        this.actionContextMenuService.getStyle
          (
            {
              x: event.clientX,
              y: event.clientY
            }
          )
      )
    }
  }

  private setCollectionMenuItems(): void {
    this.actionContextMenuItems = this.cardActionsService.getCollectionMenuItems(this.currentContextCardId, this.cardEditorFacadeService.getCurrentCardId());
  }

  private onClosedActionContextMenu(): void {
    this.resetActionContextMenuId();
    this.resetCurrentContextCardId();
  }

  private resetActionContextMenuId(): void {
    this.actionContextMenuId = '';
  }

  private resetCurrentContextCardId(): void {
    this.currentContextCardId = "";
  }

  protected performAction(item: ActionContextMenuItem): void {
    let card: Card | undefined = this.cards.find(c => c.cardId === this.currentContextCardId);

    if (!card) return;

    // CHECKME: Can we refactor this and make it something other than a switch statement? A dictionary if we really wanted to?
    switch (item.id) {
      case 0:
        item.action({ card: card, cards: this.cards });
        break;
      case 1:
        item.action({ cardId: card.cardId });
        break;
      case 2:
        item.action({ cardId: card.cardId });
        break;
      default:
        throw new Error("No default implementation for item");
    }
  }

  protected getDefaultCardScale(): number {
    return DEFAULT_CARD_SCALE;
  }

  // TODO: Refactor, use the gameRoomService here and the cardPositionPerRoomApiService here instead, pass in the item index for the subject to then communicate with the DndBoard
}