import { Component, computed, inject, input, InputSignal, Signal } from '@angular/core';
import { CardEditorPreviewService } from '../../services/card-editor-preview.service';

@Component({
  selector: 'app-card-delete-button',
  imports: [],
  templateUrl: './card-delete-button.component.html',
  styleUrl: './card-delete-button.component.scss'
})
export class CardDeleteButtonComponent {
  cardId: InputSignal<string> = input<string>("-1");
  
  private cardIdComputed: Signal<string> = computed(() => this.cardId());
  private readonly cardEditorPreviewService: CardEditorPreviewService = inject(CardEditorPreviewService);

   onClick(event: Event) {
    this.cardEditorPreviewService.deleteCard(this.cardIdComputed());
  }
}
