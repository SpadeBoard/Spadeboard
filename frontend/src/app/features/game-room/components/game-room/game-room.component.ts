import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { Card } from '../../../card-game-core/models/card';
import { CardFace } from '../../../card-game-core/models/card-face';
import { CardFaceElement } from '../../../card-game-core/models/card-face-element';
import { CardEditorComponent } from '../../../card-game-core/components/card-editor/card-editor.component';
// import { DndBoardComponent } from '../../../card-game-core/components/dnd-board/dnd-board.component';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { CdkDrag, CdkDragHandle, DragDropModule } from '@angular/cdk/drag-drop';
import { CardApiService } from '../../../card-game-core/services/card-api.service';
import { CardComponent } from '../../../card-game-core/components/card/card.component';
import { CardsCollectionComponent } from '../../../card-game-core/components/cards-collection/cards-collection.component';
import { DndBoardComponent } from '../../../card-game-core/components/dnd-board/dnd-board.component';

@Component({
  selector: 'app-game-room',
  imports: [
    CardEditorComponent, /*DndBoardComponent,*/ CommonModule,
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
  private cardsMenuRef : ElementRef | undefined;
  
  private shouldUpdateDimensions: boolean = false;

  @ViewChild('cardsMenu') set cardsMenu(content: ElementRef) {
    if(content) { // This will only run when the element is available
      this.cardsMenuRef = content;
      // Cards menu ref: {"nativeElement":{"__ngContext__":3}}, Cards menu ref native element: {"__ngContext__":3}
      // Wut
      console.log(`Cards menu ref: ${JSON.stringify(this.cardsMenuRef)}, Cards menu ref native element: ${JSON.stringify(this.cardsMenuRef.nativeElement)}`);
    }
  }

  isCardEditorOpen: boolean = false;
  isCardsCollectionMenuOpen: boolean = false;

  private cardApiService = inject(CardApiService);

  cardsMenuDimensions: {width: number, height: number} | undefined = undefined;

  // ASSUMPTION: We're opening editor without having an already existing card
  card: Card = {
    cardId: 0,
    frontCardFaceId: 0,
    backCardFaceId: 0,
    isFlipped: false,
    dndItem: {
      dndItemId: 0,
      isDraggable: false,
      isDroppable: false
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

  /*
  TODO: Cards menu cachine
  1. Load card metadata at startup, which should just be the card object itself
  2. When nedded, load the details
  3. Cache in memory or blob, using images so probably blob
  4. Use LRU to unload old cards
  5. Replace the blobs via checking timestamp of the cards and when they changed
  */

  ngAfterViewChecked(): void {
    /*if (this.shouldUpdateDimensions) {
      let rect = this.getCardsMenuClientRect();
      // FIXME: Why 0, 0
      // https://stackoverflow.com/a/57146762
      if (rect.width > 0 && rect.height > 0) {
        console.log('Size after view init:', rect.width, rect.height);

        this.cardsMenuDimensions = {
          width: rect.width,
          height: rect.height
        };

        // Doesn't work
        // this.cdr.detectChanges();
      }

      this.shouldUpdateDimensions = false;
    }*/
  }

  getCardsMenuClientRect() {
    // FIXME: Why is nativeElement undefined
    if (this.cardsMenuRef && this.cardsMenuRef.nativeElement) {
      console.log('Get cards menu client rect:', this.cardsMenuRef.nativeElement.getBoundingClientRect().width, this.cardsMenuRef.nativeElement.getBoundingClientRect().height);
      
      return this.cardsMenuRef.nativeElement.getBoundingClientRect();
    }
    return null;
  }

  // TODO: Use the CardApiService or DndBoardService to get the cards
  // TODO: Refactor because DndBoardService already has it
  getCards(): void {
    this.cardApiService.getCards(
      // ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked. Previous value: 'undefined'. Current value: '{"width":85,"height":853}'. Expression location: _GameRoomComponent component.
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

  // TODO: Use the DndBoardService to grab the cards, and put them all in a droplist, and make sure to have an exit drag
  onCardsCollection(event: Event) {
    // FIXME: This will never update, like you can add new cards so this will never run except initially

    // TODO: Make a component for the cards menu, and what we wanna do
    // is if the amount of cards is less than the amount of cards in the database for this user
    // We'd then grab that new card at that index, and then add it onto the cards
    this.isCardsCollectionMenuOpen = !this.isCardsCollectionMenuOpen;

    /*if (this.isCardsCollectionMenuOpen)
      this.shouldUpdateDimensions = true;*/
  }
}
