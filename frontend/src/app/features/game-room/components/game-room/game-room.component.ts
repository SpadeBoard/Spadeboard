import { DragDropModule } from '@angular/cdk/drag-drop';

import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CardsCollectionComponent } from '../../../card-game-core/cards-collection/component/cards-collection.component';
import { CardEditorInfoService } from '../../../card-game-core/card-editor-info/service/card-editor-info.service';
import { DEFAULT_MODAL_STYLE } from '../../../card-game-core/card-editor/constants/card-editor.constants';
import { DndBoardComponent } from '../../../drag-and-drop/board/component/core/dnd-board.component';
import { GameRoom } from '../../models/game-room';
import { GameRoomService } from '../../services/core/game-room.service';
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

  private readonly cardEditorInfoService: CardEditorInfoService = inject<CardEditorInfoService>(CardEditorInfoService);

  private readonly gameRoomService: GameRoomService = inject<GameRoomService>(GameRoomService);

  private readonly destroyRef: DestroyRef = inject<DestroyRef>(DestroyRef);

  constructor() {
    this.activateGameRoomService();

    // TODO: Grab the user ID and set it?

    this.infoUrlChange();
  }

  private activateGameRoomService(): void {
    this.gameRoomService.setCurrentGameRoomId("1");
    this.gameRoomService.getGameRoom$()
      .pipe(takeUntilDestroyed())
      .subscribe((gameRoom: GameRoom | undefined) => {
        if (gameRoom) {
          this.gameRoomService.onAutosaveTimeout(this.destroyRef);
        }
      });
  }

  protected infoUrlChange(): void {
    this.cardEditorInfoService.infoUrlChange$
    .pipe(takeUntilDestroyed())
    .subscribe((src: string) => {
      this.cardEditorInfoService.openWiki(src, DEFAULT_MODAL_STYLE);
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
