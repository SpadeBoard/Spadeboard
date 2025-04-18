import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { Card, CardDto, CardPositionPerRoom } from '../../../card-game-core/models/card';
import { CardFace } from '../../../card-game-core/models/card-face';
import { CardFaceElement } from '../../../card-game-core/models/card-face-element';
import { CardEditorComponent } from '../../../card-game-core/components/card-editor/card-editor.component';
// import { DndBoardComponent } from '../../../card-game-core/components/dnd-board/dnd-board.component';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { CdkDrag, CdkDragDrop, CdkDragHandle, DragDropModule } from '@angular/cdk/drag-drop';
import { CardApiService } from '../../../card-game-core/services/card-game-core/card-api.service';
import { CardComponent } from '../../../card-game-core/components/card/card.component';
import { CardsCollectionComponent } from '../../../card-game-core/components/cards-collection/cards-collection.component';
import { DndBoardComponent } from '../../../card-game-core/components/dnd-board/dnd-board.component';
import { DndPosition } from '../../../drag-and-drop/models/dnd-types';
import { DndBoardService } from '../../../card-game-core/services/dnd-board.service';
import { GameRoomService } from '../../services/game-room.service';
import { CardGameCoreService } from '../../../card-game-core/services/card-game-core/card-game-core.service';

@Component({
  selector: 'app-game-room',
  imports: [
    CardEditorComponent, CommonModule,
    CdkDrag, CdkDragHandle, DragDropModule,
    NgOptimizedImage,
    CardComponent, CardsCollectionComponent,
    DndBoardComponent
  ],
  templateUrl: './game-room.component.html',
  styleUrl: './game-room.component.css'
})
export class GameRoomComponent implements AfterViewChecked{
  // TODO: ViewChild being cardMenu, then grab its width and height and pass that into card
  // https://stackoverflow.com/a/41095677

  @ViewChild('dndBoard') dndBoard!: ElementRef;

  isCardEditorOpen: boolean = false;
  isCardsCollectionMenuOpen: boolean = false;

  private gameRoomService: GameRoomService = inject(GameRoomService);
  private cardGameCoreService: CardGameCoreService = inject(CardGameCoreService);

  cardsMenuDimensions: {width: number, height: number} | undefined = undefined;

  private ownerId: string = "5811e387-1551-4090-9485-a3ebe30efb5a";

   // ASSUMPTION: We're opening editor without having an already existing card
  cardDto: CardDto = {
    card: {
      cardId: 0,
      frontCardFaceId: 0,
      backCardFaceId: 0,
      isFlipped: false,
      dndItem: {
        dndItemId: 0,
        isDraggable: false,
        isDroppable: false
      }
    },
    ownerId: this.ownerId
  }

  constructor() {
    this.cardGameCoreService.setGameRoomId(1);
    this.cardGameCoreService.setUserId(this.ownerId);
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

  onCardEditor(event: Event) {
    this.isCardEditorOpen = !this.isCardEditorOpen;
    this.cardGameCoreService.setCardEditorCardDto(this.cardDto);
    console.log(`Card editor state: ${this.isCardEditorOpen}`);
  }

  onCardsCollection(event: Event) {
    this.isCardsCollectionMenuOpen = !this.isCardsCollectionMenuOpen;
    this.cardGameCoreService.setIsCardsCollectionMenuOpen(this.isCardsCollectionMenuOpen);
  }

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
