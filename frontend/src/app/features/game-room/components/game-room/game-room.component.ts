import { Component, inject } from '@angular/core';
import { Card } from '../../../card-game-core/models/card';
import { CardFace } from '../../../card-game-core/models/card-face';
import { CardFaceElement } from '../../../card-game-core/models/card-face-element';
import { CardEditorComponent } from '../../../card-game-core/components/card-editor/card-editor.component';
import { DndCardBoardComponent } from '../../../card-game-core/components/dnd-card-board/dnd-card-board.component';
import { CommonModule } from '@angular/common';
import { CdkDrag, CdkDragHandle, DragDropModule } from '@angular/cdk/drag-drop';
import { CardApiService } from '../../../card-game-core/services/card-api.service';
import { CardComponent } from '../../../card-game-core/components/card/card.component';

@Component({
  selector: 'app-game-room',
  imports: [
    CardEditorComponent, DndCardBoardComponent, CommonModule,
    CdkDrag, CdkDragHandle, DragDropModule,
    CardComponent
  ],
  templateUrl: './game-room.component.html',
  styleUrl: './game-room.component.css'
})
export class GameRoomComponent {
  isCardEditorOpen: boolean = false;
  isCardsMenuOpen: boolean = false;

  private cardApiService = inject(CardApiService);

  // ASSUMPTION: We're opening it without having an already existing card
  card: Card = {
    cardId: 0,
    frontCardFaceId: 0,
    backCardFaceId: 0,
    ownerId: '5811e387-1551-4090-9485-a3ebe30efb5a',
    isFlipped: false,
    dndItem: {
      dndItemId: 0,
      isDraggable: false,
      isDroppable: false,
      dndPosition: {
        x: 0,
        y: 0
      },
      style: {
        styleId: 0
      }
    }
  };

  frontCardFace: CardFace = {
    cardFaceId: 0,
    style: {
      styleId: 0
    }
  }

  backCardFace: CardFace = {
    cardFaceId: 0,
    style: {
      styleId: 0
    }
  }

  frontCardFaceElements: CardFaceElement[] = [

  ];

  backCardFaceElements: CardFaceElement[] = [
    
  ];

  cards: Card[] = [

  ];

  // TODO: Use the CardApiService or DndCardBoardService to get the cards
  // TODO: Refactor because DndCardBoardService already has it
  getCards(): void {
    this.cardApiService.getCards(
      "5811e387-1551-4090-9485-a3ebe30efb5a").subscribe((result: Card[] | undefined) => {
        if (result !== undefined)
        {
          this.cards = result;
          return;
        }
    });
  }

  onCardEditor(event: Event) {
    this.isCardEditorOpen = !this.isCardEditorOpen;
    console.log(`Card editor state: ${this.isCardEditorOpen}`);
  }

  // TODO: Use the DndCardBoardService to grab the cards, and put them all in a droplist, and make sure to have an exit drag
  onCards(event: Event) {
    // FIXME: This will never update, like you can add new cards so this will never run except initially
    /*
    game-room.component.ts:79 ERROR TypeError: Cannot read properties of undefined (reading 'cardFace')
    at _CardComponent.setCardStyle (card.component.ts:114:89)
    at _CardComponent.ngOnInit (card.component.ts:77:10)
    at callHookInternal (core.mjs:4195:10)
    at callHook (core.mjs:4219:7)
    at callHooks (core.mjs:4179:9)
    at executeInitAndCheckHooks (core.mjs:4134:5)
    at refreshView (core.mjs:14336:11)
    at detectChangesInView (core.mjs:14531:5)
    at detectChangesInViewIfAttached (core.mjs:14493:3)
    at detectChangesInEmbeddedViews (core.mjs:14453:7)
    */
    if (this.cards.length <= 0) {
        this.getCards();
        console.log(`On cards: ${JSON.stringify(this.cards)}`);
    }

    this.isCardsMenuOpen = !this.isCardsMenuOpen;
    console.log(`Open the cards menu so you can drag from card to board`);
  }
}
