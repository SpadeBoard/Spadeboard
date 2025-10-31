import { Component, inject } from '@angular/core';
import { CardEditorPreviewService } from '../../../card-game-core/services/card-game-core/card-editor/preview/card-editor-preview.service';
import { CardsCollectionService } from '../../../card-game-core/services/card-game-core/cards-collection/cards-collection.service';
import { GameRoomService } from '../../services/game-room.service';

@Component({
  selector: 'app-game-room-nav',
  imports: [],
  templateUrl: './game-room-nav.component.html',
  styleUrl: './game-room-nav.component.scss'
})
export class GameRoomNavComponent {
  protected isCardsCollectionMenuOpen: boolean = false;
  
  protected isGameRoomNavHovered: boolean = false;

  private readonly gameRoomService: GameRoomService = inject(GameRoomService);
 
  private readonly cardEditorPreviewService: CardEditorPreviewService = inject(CardEditorPreviewService);

  private readonly cardsCollectionService: CardsCollectionService = inject(CardsCollectionService);
  
  protected cardEditorClick(event: Event): void {
    this.cardEditorPreviewService.setIsCardEditorOpen(!this.cardEditorPreviewService.$isCardEditorOpen());
  }

  protected cardsCollectionClick(event: Event): void {
    this.isCardsCollectionMenuOpen = !this.isCardsCollectionMenuOpen;
    this.cardsCollectionService.setIsCardsCollectionMenuOpen(this.isCardsCollectionMenuOpen);
  }

  protected saveGameRoomClick(event: Event): void {
    this.gameRoomService.onSave();
  }

  protected gameRoomNavMouseEnter(event: Event): void {
    this.isGameRoomNavHovered = true;
  }

  protected gameRoomNavMouseLeave(event: Event): void {
    this.isGameRoomNavHovered = false;
  }
}
