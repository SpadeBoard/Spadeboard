import { CdkDrag, CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';

import { Component, DestroyRef, effect, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { ActionContextMenuItem } from '../../../actions-context-menu/models/action-context-menu-item';
import { ActionContextMenuService } from '../../../actions-context-menu/services/action-context-menu.service';
import { DndBoardService } from '../../../drag-and-drop/services/dnd-board.service';
import { Card, CardEditorCardDto, CardPositionPerRoom } from '../../models/card';
import { CardEditorCardDtoApiService } from '../../services/card-game-core/api/card-editor-card-dto-api.service';
import { CardEditorApiService } from '../../services/card-game-core/card-editor/api/card-editor-api.service';
import { CardEditorOperationsService } from '../../services/card-game-core/card-editor/operations/card-editor-operations.service';
import { CardEditorPreviewService } from '../../services/card-game-core/card-editor/preview/card-editor-preview.service';
import { CardFaceElementImageService } from '../../services/card-game-core/card-face-element/images/card-face-element-image.service';
import { CardFaceLodsService } from '../../services/card-game-core/card-face/lods/card-face-lods.service';
import { CardPositionPerRoomService } from '../../services/card-game-core/card-position-per-room/card-position-per-room.service';
import { CardsCollectionService } from '../../services/card-game-core/cards-collection/cards-collection.service';
import { UserService } from '../../services/user/user.service';
import { isCard } from '../../utils/card-game-core.utils';
import { DEFAULT_CARD_SCALE, getCardPositionPerRoom } from '../../utils/card.constants';
import { CardComponent } from '../card/card.component';

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
  private readonly userService: UserService = inject(UserService);

  protected readonly cardsCollectionService: CardsCollectionService = inject(CardsCollectionService);

  protected readonly cardPositionPerRoomService: CardPositionPerRoomService = inject(CardPositionPerRoomService);

  private readonly cardEditorCardDtoApiService: CardEditorCardDtoApiService = inject(CardEditorCardDtoApiService);

  private readonly dndBoardService: DndBoardService = inject(DndBoardService);

  private readonly cardEditorPreviewService: CardEditorPreviewService = inject(CardEditorPreviewService);

  private readonly cardEditorOperationsService: CardEditorOperationsService = inject(CardEditorOperationsService);

  private readonly cardEditorApiService: CardEditorApiService = inject(CardEditorApiService);

  private readonly cardFaceLodsService: CardFaceLodsService = inject(CardFaceLodsService);

  private readonly cardFaceElementImageService: CardFaceElementImageService = inject(CardFaceElementImageService);

  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  private readonly actionContextMenuService: ActionContextMenuService = inject(ActionContextMenuService);

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
    this.onCardEditorCardDtoOperations();

    // TODO: Might want to do a behavior subject instead where we get the latest card based on when we add the card
    effect(() => {
      if (this.cardsCollectionService.$isCardsCollectionMenuOpen()) this.cardsCollectionService.populateCardsCollection(this.userService.$userId(), this.cards);
    });
  }

  private onCardEditorCardDtoOperations(): void {
    this.cardEditorApiService.onOperations(this.cardEditorCardDtoOperations, this.destroyRef);
  }

  private duplicateCardObservables(cardEditorCardDto: CardEditorCardDto): Array<Observable<any>> {
    return [
      this.cardFaceElementImageService.duplicateCardFaceElementImages$(cardEditorCardDto, this.destroyRef),
      this.cardFaceLodsService.duplicateCardFaceThumbnails$(cardEditorCardDto, this.destroyRef),
    ]
  }

  protected onDragDrop(event: CdkDragDrop<any[]>, item: any): void {
    if (!event.isPointerOverContainer && isCard(item)) {
      this.cardEditorCardDtoApiService.getCardEditorCardDtoByCardId$(item.cardId).subscribe((result: CardEditorCardDto | undefined) => {
        if (!result) return;

        // CHECKME: For every face in result, we want to replace the file path, this should be a forkJoin, which then pipes and switch maps to replace the file path for all elements that are images

        // NOTE: Cards in rooms should not have an owner
        result.ownerId = '';

        this.cardEditorOperationsService.duplicateCardEditorCardDto$(result, this.duplicateCardObservables(result)).pipe(
          takeUntilDestroyed(this.destroyRef)
        )
          .subscribe((cardEditorCardDto: CardEditorCardDto | undefined) => {
            if (!cardEditorCardDto) return;

            this.createCardPositionPerRoom(getCardPositionPerRoom(cardEditorCardDto.card, this.dndBoardService.mouseAUCoordinates, this.dndBoardService.globalZIndexCounter));
          });
      })

      // console.log(`Previous Container: ${event.previousContainer}, Container: ${event.container}, Is point over container: ${event.isPointerOverContainer}, Drop point: ${JSON.stringify(event.dropPoint)}, Mouse position: ${JSON.stringify(this.mousePosition)}`);
    }
  }

  private createCardPositionPerRoom(cpr: CardPositionPerRoom): void {
    this.cardPositionPerRoomService.createdCardPositionPerRoom(cpr);
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
    this.actionContextMenuItems = this.cardEditorOperationsService.getCollectionMenuItems(this.currentContextCardId, this.cardEditorPreviewService.cardEditorCardDto.card.cardId);
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
      case 2:
        item.action({ cardId: card.cardId, cardEditorPreviewService: this.cardEditorPreviewService });
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