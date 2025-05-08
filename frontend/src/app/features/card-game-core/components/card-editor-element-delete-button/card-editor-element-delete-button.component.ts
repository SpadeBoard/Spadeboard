import { Component, computed, inject, input, InputSignal, Signal } from '@angular/core';
import { CardFaceElementApiService } from '../../services/card-game-core/card-face-element-api.service';
import { CardEditorPreviewService } from '../../services/card-editor-preview.service';

@Component({
  selector: 'app-card-editor-element-delete-button',
  imports: [],
  templateUrl: './card-editor-element-delete-button.component.html',
  styleUrl: './card-editor-element-delete-button.component.css'
})
export class CardEditorElementDeleteButtonComponent {
  cardFaceElementPerCardFaceId: InputSignal<number> = input<number>(-1);

  private cardFaceElementPerCardFaceIdComputed: Signal<number> = computed(() => this.cardFaceElementPerCardFaceId());
  private readonly cardEditorPreviewService: CardEditorPreviewService = inject(CardEditorPreviewService);

  onClick(event: Event) {
    this.cardEditorPreviewService.deleteCardFaceElementPerCardFace(this.cardFaceElementPerCardFaceIdComputed());
  }
}
