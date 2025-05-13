import { Component, inject } from '@angular/core';
import { CardGameCoreService } from '../../services/card-game-core/card-game-core.service';

@Component({
  selector: 'app-card-editor-close',
  imports: [],
  templateUrl: './card-editor-close.component.html',
  styleUrl: './card-editor-close.component.css'
})
export class CardEditorCloseComponent {
  private cardGameCoreService: CardGameCoreService = inject(CardGameCoreService);

  onClose(event: Event)
  {
     this.cardGameCoreService.setIsCardEditorOpen(!this.cardGameCoreService.isCardEditorOpen());
  }
}
