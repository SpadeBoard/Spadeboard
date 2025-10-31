import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EmbeddedExternalIframeComponent } from '../../../../utils/components/embedded-external-iframe/embedded-external-iframe.component';
import { SPADEBOARD_WIKI_CARD_EDITOR_URL } from '../../../../utils/wiki.constants';
import { CardEditorComponent } from '../../../card-game-core/components/card-editor/card-editor.component';
import { CardsCollectionComponent } from '../../../card-game-core/components/cards-collection/cards-collection.component';
import { CardEditorInfoService } from '../../../card-game-core/services/card-game-core/card-editor/info/card-editor-info.service';
import { CardEditorPreviewService } from '../../../card-game-core/services/card-game-core/card-editor/preview/card-editor-preview.service';
import { DndBoardComponent } from '../../../drag-and-drop/components/dnd-board/dnd-board.component';
import { GameRoomService } from '../../services/game-room.service';
import { GameRoomNavComponent } from '../game-room-nav/game-room-nav.component';

@Component({
  selector: 'app-game-room',
  imports: [
    CardEditorComponent, CommonModule,
    DragDropModule, CardsCollectionComponent,
    DndBoardComponent, GameRoomNavComponent,
    EmbeddedExternalIframeComponent
  ],
  templateUrl: './game-room.component.html',
  styleUrl: './game-room.component.scss'
})
export class GameRoomComponent {
  // TODO: ViewChild being cardMenu, then grab its width and height and pass that into card
  // https://stackoverflow.com/a/41095677

  private readonly cardEditorInfoService: CardEditorInfoService = inject(CardEditorInfoService);

  protected isWikiOpen: boolean = false;
  protected wikiWebsiteUrl: string = SPADEBOARD_WIKI_CARD_EDITOR_URL;

  @ViewChild('dndBoard') dndBoard!: ElementRef;
  private gameRoomService: GameRoomService = inject(GameRoomService);

  protected cardEditorPreviewService: CardEditorPreviewService = inject(CardEditorPreviewService);

  cardsMenuDimensions: { width: number, height: number } | undefined = undefined;

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
      this.wikiWebsiteUrl = src;
      this.isWikiOpen = true;
    })
  }

  protected onCloseInfo(): void {
    this.isWikiOpen = false;
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
