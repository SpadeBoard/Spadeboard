import { Component, inject } from '@angular/core';
import { CardComponent } from '../card/card.component';
import { Card } from '../../models/card';
import { CardEditorPreviewService } from '../../services/card-editor-preview.service';

@Component({
  selector: 'app-card-editor-controls-cards-template-collection',
  imports: [CardComponent],
  templateUrl: './card-editor-controls-cards-template-collection.component.html',
  styleUrl: './card-editor-controls-cards-template-collection.component.css'
})
export class CardEditorControlsCardsTemplateCollectionComponent {
  private cardEditorPreviewService: CardEditorPreviewService = inject(CardEditorPreviewService);
  
  cards: Card[] = [
    {
      cardId: 0,
      cardName: 'Blank',
      isTemplate: true,
      currentCardFaceIndex: 0
    }
  ];

  onClickCard(event: Event, cardId: number) {
    this.cardEditorPreviewService.setCardEditorCardDtoByCardTemplateId(cardId);
  }
}
