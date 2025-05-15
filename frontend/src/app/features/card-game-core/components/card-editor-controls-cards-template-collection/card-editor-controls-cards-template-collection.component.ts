import { Component, inject } from '@angular/core';
import { CardComponent } from '../card/card.component';
import { Card, CardEditorCardDto } from '../../models/card';
import { CardEditorPreviewService } from '../../services/card-editor-preview.service';
import { CardApiService } from '../../services/card-game-core/card-api.service';
import { CardGameCoreService } from '../../services/card-game-core/card-game-core.service';

@Component({
  selector: 'app-card-editor-controls-cards-template-collection',
  imports: [CardComponent],
  templateUrl: './card-editor-controls-cards-template-collection.component.html',
  styleUrl: './card-editor-controls-cards-template-collection.component.css'
})
export class CardEditorControlsCardsTemplateCollectionComponent {
  private readonly cardEditorPreviewService: CardEditorPreviewService = inject(CardEditorPreviewService);
  private readonly cardApiService: CardApiService = inject(CardApiService);
  private readonly cardGameCoreService: CardGameCoreService = inject(CardGameCoreService);

  cards: Card[] = [
    {
      cardId: "0",
      cardName: 'New',
      isTemplate: true,
      currentCardFaceIndex: 0
    }
  ];

  constructor() {
    this.getCardTemplates();
    this.onCreateCardEditorCardDto();
    this.onUpdateCardEditorCardDto();
  }

  getCardTemplates() {
    this.cardApiService.getCards$('5811e387-1551-4090-9485-a3ebe30efb5a').subscribe((cards: Card[] | undefined) => {
      if (cards) {
        let templates = cards.filter(card => card.isTemplate === true);

        this.cards = [
          {
            cardId: "0",
            cardName: 'New',
            isTemplate: true,
            currentCardFaceIndex: 0
          },
          ...templates
        ];
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
    this.cardGameCoreService.onCreateCardEditorCardDto$.subscribe((cardEditorCardDto: CardEditorCardDto) => {
      if (cardEditorCardDto && this.cards.length > 0 && cardEditorCardDto.card.isTemplate) {
        this.cards.push(cardEditorCardDto.card);
      }
    });
  }

  private onUpdateCardEditorCardDto() {
    // ASSUMPTION:
    // It's possible for cards collection to already have cards before adding the new card, i.e., cards you've made before and now are having a new session
    // You might create a new card before opening menu, so without this check, then you'd only ever add the new card that's just created, not loading all of the cards at your dispersal
    this.cardGameCoreService.onUpdateCardEditorCardDto$.subscribe((cardEditorCardDto: CardEditorCardDto) => {
      if (cardEditorCardDto && this.cards.length > 0 && cardEditorCardDto.card.isTemplate) {
        let index = this.cards.findIndex(card => card.cardId === cardEditorCardDto.card.cardId);

        if (index !== -1) {
          this.cards[index] = cardEditorCardDto.card;
        }
      }
    });
  }
}
