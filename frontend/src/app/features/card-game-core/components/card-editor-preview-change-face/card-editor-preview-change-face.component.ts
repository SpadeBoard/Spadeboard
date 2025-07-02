import { Component, inject } from '@angular/core';
import { CardEditorPreviewService } from '../../services/card-editor-preview.service';

@Component({
  selector: 'app-card-editor-preview-change-face',
  imports: [],
  templateUrl: './card-editor-preview-change-face.component.html',
  styleUrl: './card-editor-preview-change-face.component.scss'
})
export class CardEditorPreviewChangeFaceComponent {
    private cardEditorPreviewService: CardEditorPreviewService = inject(CardEditorPreviewService);
  
    get isFlipped(): boolean {
      return (this.cardEditorPreviewService.cardEditorCardDto.card.currentCardFaceIndex === 0) ? false : true;
    }

    onFlip(event: Event): void {
      this.cardEditorPreviewService.setOnFlip();
    }
}
