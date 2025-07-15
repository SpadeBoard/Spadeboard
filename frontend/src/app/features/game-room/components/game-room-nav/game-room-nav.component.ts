import { Component, inject } from '@angular/core';
import { CardGameCoreService } from '../../../card-game-core/services/card-game-core/card-game-core.service';
import { GameRoomService } from '../../services/game-room.service';

@Component({
  selector: 'app-game-room-nav',
  imports: [],
  templateUrl: './game-room-nav.component.html',
  styleUrl: './game-room-nav.component.scss'
})
export class GameRoomNavComponent {
  isCardsCollectionMenuOpen: boolean = false;
  isGameRoomNavHovered: boolean = false;

  private gameRoomService: GameRoomService = inject(GameRoomService);
  private cardGameCoreService: CardGameCoreService = inject(CardGameCoreService);

  onCardEditor(event: Event): void {
    this.cardGameCoreService.setIsCardEditorOpen(!this.cardGameCoreService.isCardEditorOpen());
  }

  onCardsCollection(event: Event): void {
    this.isCardsCollectionMenuOpen = !this.isCardsCollectionMenuOpen;
    this.cardGameCoreService.setIsCardsCollectionMenuOpen(this.isCardsCollectionMenuOpen);
  }

  onSaveGameRoom(event: Event): void {
    this.gameRoomService.onSave();
  }

  onGameRoomNavMouseEnter(event: Event): void {
    this.isGameRoomNavHovered = true;
  }

   onGameRoomNavMouseLeave(event: Event): void {
    this.isGameRoomNavHovered = false;
  }
}
