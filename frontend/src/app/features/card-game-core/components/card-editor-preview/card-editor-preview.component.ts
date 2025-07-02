import { Component, inject, ViewChild } from '@angular/core';
import { CardEditorFacePreviewComponent } from '../card-editor-face-preview/card-editor-face-preview.component';
import { CardEditorPreviewService } from '../../services/card-editor-preview.service';
import { CardEditorCardOperationsButtonComponent } from '../card-editor-card-operations-button/card-editor-card-operations-button.component';
import { CardEditorPreviewChangeFaceComponent } from '../card-editor-preview-change-face/card-editor-preview-change-face.component';
import { CardEditorPreviewTagsComponent } from '../card-editor-preview-tags/card-editor-preview-tags.component';

@Component({
  selector: 'app-card-editor-preview',
  imports: [
    CardEditorCardOperationsButtonComponent, 
    CardEditorPreviewChangeFaceComponent, 
    CardEditorFacePreviewComponent,
    CardEditorPreviewTagsComponent],
  templateUrl: './card-editor-preview.component.html',
  styleUrl: './card-editor-preview.component.scss'
})
export class CardEditorPreviewComponent {
  private cardEditorPreviewService: CardEditorPreviewService = inject(CardEditorPreviewService);
  
  @ViewChild("cardEditorFacePreview")cardEditorFacePreview!: CardEditorFacePreviewComponent;
  @ViewChild("cardOperationsBtn") cardOperationsBtn!: CardEditorCardOperationsButtonComponent;

  constructor() {
  }

  getCardName() {
   return this.cardEditorPreviewService.getCardName();
  }

  onNameChange(event: Event) {
    let value = (event.target as HTMLInputElement).value;
    this.cardEditorPreviewService.setCardName(value);
  }

  handleCardCreate() {
    // TODO: Always assign the owner ID, use the game room service here to get owner ID
    this.cardEditorPreviewService.cardEditorCardDto.ownerId = '5811e387-1551-4090-9485-a3ebe30efb5a';
    this.cardEditorFacePreview.createCard();
  }

  handleCardSave() {
    this.cardEditorFacePreview.saveCard();
  }
}
