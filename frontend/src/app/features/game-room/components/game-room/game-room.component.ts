import { DragDropModule } from '@angular/cdk/drag-drop';

import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CardsCollectionComponent } from '../../../card-game-core/components/cards-collection/cards-collection.component';
import { CardEditorInfoService } from '../../../card-game-core/services/card-game-core/card-editor/info/card-editor-info.service';
import { CardEditorPreviewService } from '../../../card-game-core/services/card-game-core/card-editor/preview/card-editor-preview.service';
import { DndBoardComponent } from '../../../drag-and-drop/components/dnd-board/dnd-board.component';
import { GameRoomService } from '../../services/game-room.service';
import { GameRoomNavComponent } from '../game-room-nav/game-room-nav.component';

@Component({
  selector: 'app-game-room',
  imports: [
    DragDropModule,
    CardsCollectionComponent,
    DndBoardComponent,
    GameRoomNavComponent
],
  templateUrl: './game-room.component.html',
  styleUrl: './game-room.component.scss'
})
export class GameRoomComponent {
  // TODO: ViewChild being cardMenu, then grab its width and height and pass that into card
  // https://stackoverflow.com/a/41095677

  private readonly cardEditorInfoService: CardEditorInfoService = inject(CardEditorInfoService);

  @ViewChild('dndBoard') dndBoard!: ElementRef;
  
  private readonly gameRoomService: GameRoomService = inject(GameRoomService);

  protected readonly cardEditorPreviewService: CardEditorPreviewService = inject(CardEditorPreviewService);

  constructor() {
    this.activateGameRoomService();

    // TODO: Grab the user ID and set it?

    this.infoUrlChange();
  }

  private activateGameRoomService(): void {
    this.gameRoomService.setCurrentGameRoomId("1");
    this.gameRoomService.getGameRoom$()
      .pipe(takeUntilDestroyed())
      .subscribe((gameRoom) => {
        if (gameRoom) {
          this.gameRoomService.onAutosaveTimeout();
        }
      });
  }

  protected infoUrlChange(): void {
    this.cardEditorInfoService.infoUrlChange$.subscribe((src: string) => {
      this.cardEditorInfoService.openWiki(src, this.cardEditorInfoService.getStyle());
    })
  }

  /*
  TODO: Cards menu cachine
  1. Load card metadata at startup, which should just be the card object itself
  2. When nedded, load the details
  3. Cache in memory or blob, using images so probably blob
  4. Use LRU to unload old cards
  5. Replace the blobs via checking timestamp of the cards and when they changed
  */
}
