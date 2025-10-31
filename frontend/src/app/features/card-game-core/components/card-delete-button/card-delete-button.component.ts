import { Component, inject, input, InputSignal } from '@angular/core';
import { CardEditorOperationsService } from '../../services/card-game-core/card-editor/operations/card-editor-operations.service';

@Component({
  selector: 'app-card-delete-button',
  imports: [],
  templateUrl: './card-delete-button.component.html',
  styleUrl: './card-delete-button.component.scss'
})
export class CardDeleteButtonComponent {
  public cardId: InputSignal<string> = input<string>("-1");

  private readonly cardEditorOperationsService: CardEditorOperationsService = inject(CardEditorOperationsService);

  protected onClick(event: Event): void {
    this.cardEditorOperationsService.deleteCard(this.cardId());
  }
}