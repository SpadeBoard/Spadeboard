import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Coordinates } from '../../../../utils/utils';
import { ActionContextMenuComponent } from '../../../actions-context-menu/components/action-context-menu/action-context-menu/action-context-menu.component';
import { ActionContextMenuItem } from '../../../actions-context-menu/models/action-context-menu-item';
import { Card, CardEditorCardDto } from '../../models/card';
import { CardEditorPreviewService } from '../../services/card-editor-preview.service';
import { TagsPerCardApiService } from '../../services/card-game-core/api/tags-per-card-api.service';
import { CardDeleteButtonComponent } from '../card-delete-button/card-delete-button.component';
import { CardComponent } from '../card/card.component';
import { DEFAULT_CARD_SCALE } from '../../utils/card.constants';

@Component({
  selector: 'app-card-editor-controls-cards-template-collection',
  imports: [CardComponent, CardDeleteButtonComponent, CommonModule, ActionContextMenuComponent],
  templateUrl: './card-editor-controls-cards-template-collection.component.html',
  styleUrl: './card-editor-controls-cards-template-collection.component.scss'
})
export class CardEditorControlsCardsTemplateCollectionComponent {
  private readonly cardEditorPreviewService: CardEditorPreviewService = inject(CardEditorPreviewService);
  private readonly tagsPerCardApiService: TagsPerCardApiService = inject(TagsPerCardApiService);;

  getDefaultCardScale(): number {
    return DEFAULT_CARD_SCALE;
  }
  
  cards: Card[] = [];

  new: Card =  {
      cardId: "0",
      cardName: 'New',
      currentCardFaceIndex: 0
    }

  private contextMenuPosition: Coordinates = {
      x: 0,
      y: 0
    };
    
  currentContextMenuId: string = "";

  actionContextMenuItems: ActionContextMenuItem[] = [
    {
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
    }
  ];

  constructor() {
    this.getCardTemplates();
    
    this.onCreateCardEditorCardDto();
    this.onUpdateCardEditorCardDto();
    this.onDeleteCardEditorCardDto();
  }

  getCurrentEditedCardId(): string {
    return this.cardEditorPreviewService.cardEditorCardDto.card.cardId;
  }

  getCardTemplates() {
    this.tagsPerCardApiService.getCardTemplatesByOwnerId$('5811e387-1551-4090-9485-a3ebe30efb5a').subscribe((cards: Card[] | undefined) => {
      console.log(`Get card templates by owner ID: ${JSON.stringify(cards)}`);
      
      if (cards) this.cards = cards;
    });
  }

  onClickCard(event: Event, cardId: string) {
    this.cardEditorPreviewService.setCardEditorCardDtoByCardId(cardId);
  }

  private onCreateCardEditorCardDto() {
    // ASSUMPTION:
    // It's possible for cards collection to already have cards before adding the new card, i.e., cards you've made before and now are having a new session
    // You might create a new card before opening menu, so without this check, then you'd only ever add the new card that's just created, not loading all of the cards at your dispersal
    this.cardEditorPreviewService.onCreateCardEditorCardDto$
      .pipe(takeUntilDestroyed())
      .subscribe((cardEditorCardDto: CardEditorCardDto) => {
        if (!cardEditorCardDto)
          throw new Error("No card editor card DTO to create");

        console.log(`onCreateCardEditorCardDto tag names: ${JSON.stringify(cardEditorCardDto.tagNames)}`);

        this.addCardTemplate(cardEditorCardDto);
    });
  }

  private onUpdateCardEditorCardDto() {
    // ASSUMPTION:
    // It's possible for cards collection to already have cards before adding the new card, i.e., cards you've made before and now are having a new session
    // You might create a new card before opening menu, so without this check, then you'd only ever add the new card that's just created, not loading all of the cards at your dispersal
    this.cardEditorPreviewService.onUpdateCardEditorCardDto$
      .pipe(takeUntilDestroyed())
      .subscribe((cardEditorCardDto: CardEditorCardDto) => {
        if (!cardEditorCardDto)
          throw new Error("No card editor card DTO to update");

        console.log(`onUpdateCardEditorCardDto tag names: ${JSON.stringify(cardEditorCardDto.tagNames)}`);
        
        let index: number = this.cards.findIndex(card => card.cardId === cardEditorCardDto.card.cardId);
        if (index !== -1) {
          if (!this.cardEditorPreviewService.isCardTemplate(cardEditorCardDto)) {
            this.removeCardTemplate(cardEditorCardDto.card.cardId);
            return;
          }

          this.cards[index] = cardEditorCardDto.card;
          return;
        }
        
        this.addCardTemplate(cardEditorCardDto);
      });
  }

  // TODO: Too much duplication between cards-collection and here, make a service for cards collection and then use these functions to populate here
  private onDeleteCardEditorCardDto() {
    this.cardEditorPreviewService.onDeleteCardEditorCardDto$
      .pipe(takeUntilDestroyed())
      .subscribe((cardId: string) => {
        this.removeCardTemplate(cardId);
      });
  }

  private addCardTemplate(cardEditorCardDto: CardEditorCardDto): boolean {
    if (this.cardEditorPreviewService.isCardTemplate(cardEditorCardDto)) {
      this.cards.push(cardEditorCardDto.card);
    }

    return this.cards.includes(cardEditorCardDto.card);
  }

  private removeCardTemplate(cardId: string): void {
    this.cards = this.cards.filter(c => c.cardId !== cardId);
  }

  onCardRightClick(event: MouseEvent, cardId: string): void {
    if (cardId === "0")
      return;

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
  documentClick(): void {
    this.currentContextMenuId = "";
  }

  getRightClickMenuStyle() {
    return {
      position: 'absolute', // Due to menu ancestor
      left: `${this.contextMenuPosition.x}px`,
      top: `${this.contextMenuPosition.y}px`,
    }
  }

  handleActionContextMenuItemClick(item: ActionContextMenuItem) {
    let card: Card | undefined = this.cards.find(c => c.cardId === this.currentContextMenuId);

    if (card)
      item.action(card);
  }
}
