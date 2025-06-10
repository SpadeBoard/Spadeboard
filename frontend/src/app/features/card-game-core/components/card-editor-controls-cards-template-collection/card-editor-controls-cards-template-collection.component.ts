import { Component, HostListener, inject } from '@angular/core';
import { CardComponent } from '../card/card.component';
import { Card, CardEditorCardDto } from '../../models/card';
import { CardEditorPreviewService } from '../../services/card-editor-preview.service';
import { CardApiService } from '../../services/card-game-core/api/card-api.service';
import { CardGameCoreService } from '../../services/card-game-core/card-game-core.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CardDeleteButtonComponent } from '../card-delete-button/card-delete-button.component';
import { ActionContextMenuItem } from '../../../actions-context-menu/models/action-context-menu-item';
import { ActionContextMenuComponent } from '../../../actions-context-menu/components/action-context-menu/action-context-menu/action-context-menu.component';
import { CommonModule } from '@angular/common';
import { Coordinates } from '../../../../utils/utils';

@Component({
  selector: 'app-card-editor-controls-cards-template-collection',
  imports: [CardComponent, CardDeleteButtonComponent, CommonModule, ActionContextMenuComponent],
  templateUrl: './card-editor-controls-cards-template-collection.component.html',
  styleUrl: './card-editor-controls-cards-template-collection.component.css'
})
export class CardEditorControlsCardsTemplateCollectionComponent {
  private readonly cardEditorPreviewService: CardEditorPreviewService = inject(CardEditorPreviewService);
  private readonly cardApiService: CardApiService = inject(CardApiService);
  private readonly cardGameCoreService: CardGameCoreService = inject(CardGameCoreService);

  cards: Card[] = [];

  new: Card =  {
      cardId: "0",
      cardName: 'New',
      isTemplate: true,
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
    this.cardApiService.getCards$('5811e387-1551-4090-9485-a3ebe30efb5a').subscribe((cards: Card[] | undefined) => {
      if (cards) {
        this.cards = cards.filter(card => card.isTemplate === true);
      }
    })
  }

  onClickCard(event: Event, cardId: string) {
    this.cardEditorPreviewService.setCardEditorCardDtoByCardId(cardId);
  }

  private onCreateCardEditorCardDto() {
    // ASSUMPTION:
    // It's possible for cards collection to already have cards before adding the new card, i.e., cards you've made before and now are having a new session
    // You might create a new card before opening menu, so without this check, then you'd only ever add the new card that's just created, not loading all of the cards at your dispersal
    this.cardGameCoreService.onCreateCardEditorCardDto$
      .pipe(takeUntilDestroyed())
      .subscribe((cardEditorCardDto: CardEditorCardDto) => {
      if (cardEditorCardDto && cardEditorCardDto.card.isTemplate) {
        this.cards.push(cardEditorCardDto.card);
      }
    });
  }

  private onUpdateCardEditorCardDto() {
    // ASSUMPTION:
    // It's possible for cards collection to already have cards before adding the new card, i.e., cards you've made before and now are having a new session
    // You might create a new card before opening menu, so without this check, then you'd only ever add the new card that's just created, not loading all of the cards at your dispersal
    this.cardGameCoreService.onUpdateCardEditorCardDto$
      .pipe(takeUntilDestroyed())
      .subscribe((cardEditorCardDto: CardEditorCardDto) => {
      if (cardEditorCardDto && cardEditorCardDto.card.isTemplate) {
        let index = this.cards.findIndex(card => card.cardId === cardEditorCardDto.card.cardId);

        if (index !== -1) {
          this.cards[index] = cardEditorCardDto.card;
        }
      }
    });
  }

  // TODO: Too much duplication between cards-collection and here, make a service for cards collection and then use these functions to populate here
  private onDeleteCardEditorCardDto() {
    this.cardGameCoreService.onDeleteCardEditorCardDto$
      .pipe(takeUntilDestroyed())
      .subscribe((cardId: string) => {
        this.cards = this.cards.filter(c => c.cardId !== cardId);
      });
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
