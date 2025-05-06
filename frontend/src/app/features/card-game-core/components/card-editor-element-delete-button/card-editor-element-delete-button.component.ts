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
  cardFaceElementId: InputSignal<number> = input<number>(-1);

  private cardFaceElementIdComputed: Signal<number> = computed(() => this.cardFaceElementId());
  private readonly cardEditorPreviewService: CardEditorPreviewService = inject(CardEditorPreviewService);

  onClick(event: Event) {
    this.cardEditorPreviewService.deleteCardFaceElement(this.cardFaceElementIdComputed());
  }
}
