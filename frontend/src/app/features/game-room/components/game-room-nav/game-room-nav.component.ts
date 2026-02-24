import { Component, inject } from '@angular/core';
import { CardEditorModalService } from '../../../card-game-core/card-editor/services/modal/card-editor-modal.service';
import { CardsCollectionService } from '../../../card-game-core/cards-collection/service/cards-collection.service';
import { GameRoomService } from '../../services/core/game-room.service';

@Component({
  selector: 'app-game-room-nav',
  imports: [],
  templateUrl: './game-room-nav.component.html',
  styleUrl: './game-room-nav.component.scss'
})
export class GameRoomNavComponent {
  protected isCardsCollectionMenuOpen: boolean = false;
  
  protected isGameRoomNavHovered: boolean = false;

  private readonly gameRoomService: GameRoomService = inject<GameRoomService>(GameRoomService);

  private readonly cardEditorModalService: CardEditorModalService = inject<CardEditorModalService>(CardEditorModalService);

  private readonly cardsCollectionService: CardsCollectionService = inject<CardsCollectionService>(CardsCollectionService);
  
  protected cardEditorClick(event: Event): void {
    this.cardEditorModalService.toggleCardEditor(!this.cardEditorModalService.$isCardEditorOpen());
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
