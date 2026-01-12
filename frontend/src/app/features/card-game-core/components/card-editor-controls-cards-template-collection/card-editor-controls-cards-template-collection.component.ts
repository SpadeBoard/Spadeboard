
import { Component, HostListener, inject } from '@angular/core';
import { Coordinates } from '../../../../utils/utils';
import { ActionContextMenuComponent } from '../../../actions-context-menu/components/action-context-menu/action-context-menu/action-context-menu.component';
import { ActionContextMenuItem } from '../../../actions-context-menu/models/action-context-menu-item';
import { Card, CardEditorCardDto } from '../../models/card';
import { CardEditorPreviewService } from '../../services/card-game-core/card-editor/preview/card-editor-preview.service';
import { CardTemplateService } from '../../services/card-game-core/card-template/card-template.service';
import { DEFAULT_CARD_SCALE, getFlip } from '../../utils/card.constants';
import { CardDeleteButtonComponent } from '../card-delete-button/card-delete-button.component';
import { CardComponent } from '../card/card.component';
import { NewCardTemplateCollectionComponent } from '../new-card-template-collection/new-card-template-collection.component';
import { CardEditorApiService } from '../../services/card-game-core/card-editor/api/card-editor-api.service';

@Component({
  selector: 'app-card-editor-controls-cards-template-collection',
  imports: [NewCardTemplateCollectionComponent, CardComponent, CardDeleteButtonComponent, ActionContextMenuComponent],
  templateUrl: './card-editor-controls-cards-template-collection.component.html',
  styleUrl: './card-editor-controls-cards-template-collection.component.scss'
})
export class CardEditorControlsCardsTemplateCollectionComponent {
  private readonly cardEditorPreviewService: CardEditorPreviewService = inject(CardEditorPreviewService);
  private readonly cardEditorApiService: CardEditorApiService = inject(CardEditorApiService);
  private readonly cardTemplateService: CardTemplateService = inject(CardTemplateService);

  protected getDefaultCardScale(): number {
    return DEFAULT_CARD_SCALE;
  }

  public cards: Card[] = [];

  public new: Card = {
    cardId: "0",
    cardName: 'New',
    currentCardFaceIndex: 0
  }

  private contextMenuPosition: Coordinates = {
    x: 0,
    y: 0
  };

  public currentContextMenuId: string = "";

  public actionContextMenuItems: ActionContextMenuItem[] = [getFlip()];
  
  private cardEditorCardDtoOperations: Map<string, Function> = new Map<string, Function>([
    ['create', (cardEditorCardDto: CardEditorCardDto) => this.addCardTemplate(cardEditorCardDto)],
    ['update', (cardEditorCardDto: CardEditorCardDto) => this.updateCardTemplate(cardEditorCardDto)],
    ['delete', (cardId: string) => this.removeCardTemplate(cardId)]
  ]);

  constructor() {
    this.cardTemplateService.getCardTemplates('5811e387-1551-4090-9485-a3ebe30efb5a', this.cards);

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
    if (cardId === "0") return;

    event.preventDefault();

    /// Find the .menu element (ancestor), might just want to use a template ref? Not sure.
    let menuElem: HTMLElement | null = (event.currentTarget as HTMLElement).closest('.menu') as HTMLElement | null;
    if (!menuElem) return;

    let menuRect: DOMRect = menuElem.getBoundingClientRect();

    // Calculate mouse position relative to .menu
    this.contextMenuPosition = {
      x: event.clientX - menuRect.left,
      y: event.clientY - menuRect.top
    }

    this.currentContextMenuId = cardId;
  }

  @HostListener('document:click')
  protected documentClick(): void {
    this.currentContextMenuId = "";
  }

  protected getRightClickMenuStyle(): {
    position: string;
    left: string;
    top: string;
  } {
    return {
      position: 'absolute', // Due to menu ancestor
      left: `${this.contextMenuPosition.x}px`,
      top: `${this.contextMenuPosition.y}px`,
    }
  }

  protected performAction(item: ActionContextMenuItem): void {
    let card: Card | undefined = this.cards.find(c => c.cardId === this.currentContextMenuId);

    if (card)
      item.action(
        {
          card: card,
          cards: this.cards
        }
      );
  }
}
