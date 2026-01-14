
import { Component, inject } from '@angular/core';
import { ActionContextMenuItem } from '../../../actions-context-menu/models/action-context-menu-item';
import { ActionContextMenuService } from '../../../actions-context-menu/services/action-context-menu.service';
import { Card, CardEditorCardDto } from '../../models/card';
import { CardEditorApiService } from '../../services/card-game-core/card-editor/api/card-editor-api.service';
import { CardEditorPreviewService } from '../../services/card-game-core/card-editor/preview/card-editor-preview.service';
import { CardTemplateService } from '../../services/card-game-core/card-template/card-template.service';
import { DEFAULT_CARD_SCALE, getFlip } from '../../utils/card.constants';
import { DEFAULT_USER_ID } from '../../utils/user.constants';
import { CardDeleteButtonComponent } from '../card-delete-button/card-delete-button.component';
import { CardComponent } from '../card/card.component';
import { NewCardTemplateCollectionComponent } from '../new-card-template-collection/new-card-template-collection.component';

@Component({
  selector: 'app-card-editor-controls-cards-template-collection',
  imports: [NewCardTemplateCollectionComponent, CardComponent, CardDeleteButtonComponent],
  templateUrl: './card-editor-controls-cards-template-collection.component.html',
  styleUrl: './card-editor-controls-cards-template-collection.component.scss'
})
export class CardEditorControlsCardsTemplateCollectionComponent {
  private readonly cardEditorPreviewService: CardEditorPreviewService = inject(CardEditorPreviewService);
  private readonly cardEditorApiService: CardEditorApiService = inject(CardEditorApiService);
  private readonly cardTemplateService: CardTemplateService = inject(CardTemplateService);

  private readonly actionContextMenuService: ActionContextMenuService = inject(ActionContextMenuService);

  protected getDefaultCardScale(): number {
    return DEFAULT_CARD_SCALE;
  }

  public cards: Card[] = [];

  public new: Card = {
    cardId: "0",
    cardName: 'New',
    currentCardFaceIndex: 0
  }

  public currentContextCardId: string = "";

  public actionContextMenuItems: ActionContextMenuItem[] = [getFlip()];

  private cardEditorCardDtoOperations: Map<string, Function> = new Map<string, Function>([
    ['create', (cardEditorCardDto: CardEditorCardDto) => this.addCardTemplate(cardEditorCardDto)],
    ['update', (cardEditorCardDto: CardEditorCardDto) => this.updateCardTemplate(cardEditorCardDto)],
    ['delete', (cardId: string) => this.removeCardTemplate(cardId)]
  ]);

  private actionContextMenuId: string = '';

  constructor() {
    this.cardTemplateService.getCardTemplates(DEFAULT_USER_ID, this.cards);

    this.onCardEditorCardDtoOperations();
  }

  protected getCurrentEditedCardId(): string {
    return this.cardEditorPreviewService.cardEditorCardDto.card.cardId;
  }

  protected onClickCard(event: Event, cardId: string): void {
    this.cardEditorPreviewService.setCardEditorCardDtoByCardId(cardId);
  }

  private addCardTemplate(cardEditorCardDto: CardEditorCardDto): void {
    if (!this.cardTemplateService.addCardTemplate(cardEditorCardDto, this.cards)) console.error("Isn't a card template but attempted to add it as one");
  }

  private updateCardTemplate(cardEditorCardDto: CardEditorCardDto): void {
    let index: number = this.cards.findIndex(card => card.cardId === cardEditorCardDto.card.cardId);
    if (index !== -1) {
      if (this.hasRemovedCardTemplate(cardEditorCardDto, this.cards)) return;

      this.cards[index] = { ...cardEditorCardDto.card };
      return;
    }

    if (!this.cardTemplateService.addCardTemplate(cardEditorCardDto, this.cards)) console.error("Isn't a card template but attempted to add it as one");
  }

  private onCardEditorCardDtoOperations(): void {
    this.cardEditorApiService.onOperations(this.cardEditorCardDtoOperations);
  }

  private removeCardTemplate(cardId: string): void {
    this.cards = this.cardTemplateService.removeCardTemplate(cardId, this.cards);
  }

  private hasRemovedCardTemplate(cardEditorCardDto: CardEditorCardDto, cards: Card[]): boolean {
    let { cardId } = cardEditorCardDto.card;

    this.cards = this.cardTemplateService.removeCardTemplate(cardEditorCardDto, this.cards);

    return !cards.findIndex(c => c.cardId === cardId);
  }

  protected onCardRightClick(event: MouseEvent, cardId: string): void {
    event.preventDefault();

    if (cardId === "0") return;

    this.currentContextCardId = cardId;

    // FIXME: You can have multiple items open simultaneously, so no
    if (!this.actionContextMenuId) {
      this.actionContextMenuId = this.actionContextMenuService.open(
        this.actionContextMenuItems,
        (item: ActionContextMenuItem) => this.performAction(item),
        this.actionContextMenuService.getStyle(
          {
            x: event.clientX,
            y: event.clientY
          }),
        () => this.onClosedActionContextMenu());
    }
    else {
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

    if (card)
      item.action(
        {
          card: card,
          cards: this.cards
        }
      );
  }
}
