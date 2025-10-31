import { Component, inject } from '@angular/core';
import { CardEditorPreviewService } from '../../services/card-game-core/card-editor/preview/card-editor-preview.service';
import { CardEditorOperationsService } from '../../services/card-game-core/card-editor/operations/card-editor-operations.service';

@Component({
  selector: 'app-card-editor-preview-change-face',
  imports: [],
  templateUrl: './card-editor-preview-change-face.component.html',
  styleUrl: './card-editor-preview-change-face.component.scss'
})
export class CardEditorPreviewChangeFaceComponent {
    private readonly cardEditorPreviewService: CardEditorPreviewService = inject(CardEditorPreviewService);

    private readonly cardEditorOperationsService: CardEditorOperationsService = inject(CardEditorOperationsService);
  
    get isFlipped(): boolean {
      return this.cardEditorPreviewService.isFlipped();
    }

    protected onFlip(event: Event): void {
      this.cardEditorOperationsService.onFlip();
    }
}
