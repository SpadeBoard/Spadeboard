import { Component, inject, output } from '@angular/core';
import { CardEditorPreviewService } from '../../services/card-editor-preview.service';
import { CardEditorCardDto } from '../../models/card';

@Component({
  selector: 'app-card-editor-card-operations-button',
  imports: [],
  templateUrl: './card-editor-card-operations-button.component.html',
  styleUrl: './card-editor-card-operations-button.component.css'
})
export class CardEditorCardOperationsButtonComponent {
  private cardEditorPreviewService: CardEditorPreviewService = inject(CardEditorPreviewService);

  hasCreated: boolean = false;

  handleCardCreate = output<void>();
  handleCardSave = output<void>();

  constructor() {
    this.setHasCreated();
    this.onCreateCard();
  }

  private onCreateCard() {
    this.cardEditorPreviewService.onCreateCard$.subscribe(() => {
     this.setHasCreated();
    })
  }

  private setHasCreated() {
    this.hasCreated = (this.cardEditorPreviewService.cardEditorCardDto.card.cardId > 0) ? true : false;
  }

  onCardCreate(event: Event): void {
    this.handleCardCreate.emit();
  }

  onCardSave(event: Event): void {
    this.handleCardSave.emit();
  }

  onSaveTemplate(event: Event) {
    this.cardEditorPreviewService.cardEditorCardDto.card.isTemplate = true;
    this.handleCardCreate.emit();
  }
}
