import { Component, inject } from '@angular/core';
import { CardEditorPreviewService } from '../../services/card-editor-preview.service';

@Component({
  selector: 'app-card-editor-preview-change-face',
  imports: [],
  templateUrl: './card-editor-preview-change-face.component.html',
  styleUrl: './card-editor-preview-change-face.component.css'
})
export class CardEditorPreviewChangeFaceComponent {
    private cardEditorPreviewService: CardEditorPreviewService = inject(CardEditorPreviewService);
  
    onFlip(event: Event): void {
      this.cardEditorPreviewService.setOnFlip();
    }
}
