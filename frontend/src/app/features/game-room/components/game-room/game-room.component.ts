import { AfterViewChecked, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { CardEditorComponent } from '../../../card-game-core/components/card-editor/card-editor.component';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CardsCollectionComponent } from '../../../card-game-core/components/cards-collection/cards-collection.component';
import { DndBoardComponent } from '../../../drag-and-drop/components/dnd-board/dnd-board.component';
import { GameRoomService } from '../../services/game-room.service';
import { CardGameCoreService } from '../../../card-game-core/services/card-game-core/card-game-core.service';
import { GameRoomNavComponent } from '../game-room-nav/game-room-nav.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-game-room',
  imports: [
    CardEditorComponent, CommonModule,
    DragDropModule, CardsCollectionComponent,
    DndBoardComponent, GameRoomNavComponent,
  ],
  templateUrl: './game-room.component.html',
  styleUrl: './game-room.component.css'
})
export class GameRoomComponent implements AfterViewChecked{
  // TODO: ViewChild being cardMenu, then grab its width and height and pass that into card
  // https://stackoverflow.com/a/41095677

  @ViewChild('dndBoard') dndBoard!: ElementRef;
  private gameRoomService: GameRoomService = inject(GameRoomService);
  cardGameCoreService: CardGameCoreService = inject(CardGameCoreService);

  cardsMenuDimensions: {width: number, height: number} | undefined = undefined;

  private ownerId: string = "5811e387-1551-4090-9485-a3ebe30efb5a";

  constructor() {
    this.activateGameRoomService();
    
    this.cardGameCoreService.setUserId(this.ownerId);
  }

  activateGameRoomService() {
    this.gameRoomService.setCurrentGameRoomId("1");
    this.gameRoomService.getGameRoom$()
      .pipe(takeUntilDestroyed())
      .subscribe((gameRoom) => {
      if (gameRoom) {
        this.gameRoomService.onAutosaveTimeout();
      }
    });
  }

  ngAfterViewChecked(): void {

  }

  /*
  TODO: Cards menu cachine
  1. Load card metadata at startup, which should just be the card object itself
  2. When nedded, load the details
  3. Cache in memory or blob, using images so probably blob
  4. Use LRU to unload old cards
  5. Replace the blobs via checking timestamp of the cards and when they changed
  */

  // https://fluin.io/blog/things-I-wish-I-knew-about-CDK-drag-drop
  // https://stackblitz.com/edit/drag-drop-dashboard?file=src%2Fapp%2Fapp.component.ts
  // https://next.material.angular.io/cdk/drag-drop/api

  // MATH:
  // https://forums.unrealengine.com/t/get-mouse-position-on-viewport/111399/2
  // Function Get Mouse Position on Viewport and multiply the result by Function: Get Viewport Scale

  // TODO: Screen or webpage?
  // https://stackoverflow.com/questions/14717617/how-to-get-the-mouse-position-relative-to-the-window-viewport-in-javascript

  // https://stackblitz.com/edit/angular-cdk-nested-drag-drop-tree-structure-zvsafw?file=src%2Fapp%2Fapp.component.ts
}
