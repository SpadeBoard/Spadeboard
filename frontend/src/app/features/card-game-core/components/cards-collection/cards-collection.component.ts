import { CdkDrag, CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, effect, HostListener, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { Coordinates, getMidpoint } from '../../../../utils/utils';
import { ActionContextMenuComponent } from '../../../actions-context-menu/components/action-context-menu/action-context-menu/action-context-menu.component';
import { ActionContextMenuItem } from '../../../actions-context-menu/models/action-context-menu-item';
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
    CardComponent, CommonModule,
    CdkDrag, DragDropModule, ActionContextMenuComponent
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

  protected cards: Card[] = [];

  private contextMenuPosition: Coordinates = {
    x: 0,
    y: 0
  };

  protected currentContextMenuId: string = "";

  protected actionContextMenuItems: ActionContextMenuItem[] = [];

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
    this.cardEditorApiService.onOperations(this.cardEditorCardDtoOperations);
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

  protected onCardRightClick(event: MouseEvent, cardId: string): void {
    if (!cardId) return;

    event.preventDefault();

    let cardElem: HTMLElement = event.currentTarget as HTMLElement;
    let cardRect: DOMRect = cardElem.getBoundingClientRect();

    this.setContextMenuPosition(cardRect);

    this.currentContextMenuId = cardId;

    this.setCollectionMenuItems();
  }

  private setCollectionMenuItems(): void {
    this.actionContextMenuItems = this.cardEditorOperationsService.getCollectionMenuItems(this.currentContextMenuId, this.cardEditorPreviewService.cardEditorCardDto.card.cardId);
  }

  private setContextMenuPosition(cardRect: DOMRect): void {
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
  }


  @HostListener('document:click')
  protected documentClick(): void {
    this.currentContextMenuId = "";
  }

  // NOTE: Should be right considering it's not a child of the cards-menu
  protected getRightClickMenuStyle(): {
    position: string;
    left: string;
    top: string;
  } {
    return {
      position: 'fixed',
      left: `${this.contextMenuPosition.x}px`,
      top: `${this.contextMenuPosition.y}px`
    }
  }

  protected performAction(item: ActionContextMenuItem): void {
    let card: Card | undefined = this.cards.find(c => c.cardId === this.currentContextMenuId);

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