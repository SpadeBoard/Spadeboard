import { Component, inject, input, InputSignal } from '@angular/core';
import { CardFaceElementService } from '../../services/card-game-core/card-face-element/card-face-element.service';

@Component({
  selector: 'app-card-editor-element-delete-button',
  imports: [],
  templateUrl: './card-editor-element-delete-button.component.html',
  styleUrl: './card-editor-element-delete-button.component.scss'
})
export class CardEditorElementDeleteButtonComponent {
  public readonly $cardFaceElementPerCardFaceId: InputSignal<string> = input<string>("-1");
  
  private readonly cardFaceElementService: CardFaceElementService = inject(CardFaceElementService);

  protected onClick(event: Event): void {
    this.cardFaceElementService.deletedCardFaceElementPerCardFace(this.$cardFaceElementPerCardFaceId());
  }
}
