import { Component, inject } from '@angular/core';
import { CardEditorPreviewService } from '../../services/card-game-core/card-editor/preview/card-editor-preview.service';

@Component({
  selector: 'app-card-editor-close',
  imports: [],
  templateUrl: './card-editor-close.component.html',
  styleUrl: './card-editor-close.component.scss'
})
export class CardEditorCloseComponent {
  private readonly cardEditorPreviewService: CardEditorPreviewService = inject(CardEditorPreviewService);

  protected onClose(event: Event): void {
    this.cardEditorPreviewService.toggleCardEditor(!this.cardEditorPreviewService.$isCardEditorOpen());
  }
}
