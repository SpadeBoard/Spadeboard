import { Component, effect, ElementRef, inject, ViewChild } from '@angular/core';
import { CardGameCoreService } from '../../services/card-game-core/card-game-core.service';
import { CardEditorCardDto } from '../../models/card';
import { CardEditorFacePreviewComponent } from '../card-editor-face-preview/card-editor-face-preview.component';
import { CardEditorCurrentCardFaceElementsPerCardFaceComponent } from '../card-editor-current-card-face-elements-per-card-face/card-editor-current-card-face-elements-per-card-face.component';
import { CardEditorPreviewService } from '../../services/card-editor-preview.service';
import { CardEditorCardOperationsButtonComponent } from '../card-editor-card-operations-button/card-editor-card-operations-button.component';
import { CardEditorPreviewChangeFaceComponent } from '../card-editor-preview-change-face/card-editor-preview-change-face.component';

@Component({
  selector: 'app-card-editor-preview',
  imports: [CardEditorCardOperationsButtonComponent, CardEditorPreviewChangeFaceComponent, CardEditorFacePreviewComponent, CardEditorCurrentCardFaceElementsPerCardFaceComponent],
  templateUrl: './card-editor-preview.component.html',
  styleUrl: './card-editor-preview.component.css'
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
    this.cardEditorFacePreview.createCard();
  }

  handleCardSave() {

  }
}
