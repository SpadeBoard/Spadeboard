import { Component, inject } from '@angular/core';
import { CardComponent } from '../card/card.component';
import { Card } from '../../models/card';
import { CardEditorPreviewService } from '../../services/card-editor-preview.service';
import { CardApiService } from '../../services/card-game-core/card-api.service';

@Component({
  selector: 'app-card-editor-controls-cards-template-collection',
  imports: [CardComponent],
  templateUrl: './card-editor-controls-cards-template-collection.component.html',
  styleUrl: './card-editor-controls-cards-template-collection.component.css'
})
export class CardEditorControlsCardsTemplateCollectionComponent {
  private cardEditorPreviewService: CardEditorPreviewService = inject(CardEditorPreviewService);
  private cardApiService: CardApiService = inject(CardApiService);

  cards: Card[] = [
    {
      cardId: 0,
      cardName: 'Blank',
      isTemplate: true,
      currentCardFaceIndex: 0
    }
  ];

  constructor() {
    this.getCardTemplates();
  }

  getCardTemplates() {
    this.cardApiService.getCards$('5811e387-1551-4090-9485-a3ebe30efb5a').subscribe((cards: Card[] | undefined) => {
      if (cards) {
        let templates = cards.filter(card => card.isTemplate === true);

        this.cards = [
          {
            cardId: 0,
            cardName: 'Blank',
            isTemplate: true,
            currentCardFaceIndex: 0
          },
          ...templates
        ];
      }
    })
  }

  onClickCard(event: Event, cardId: number) {
    this.cardEditorPreviewService.setCardEditorCardDtoByCardTemplateId(cardId);
  }
}
