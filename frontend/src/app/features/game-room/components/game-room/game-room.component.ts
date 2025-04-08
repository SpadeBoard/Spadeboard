import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { Card } from '../../../card-game-core/models/card';
import { CardFace } from '../../../card-game-core/models/card-face';
import { CardFaceElement } from '../../../card-game-core/models/card-face-element';
import { CardEditorComponent } from '../../../card-game-core/components/card-editor/card-editor.component';
// import { DndCardBoardComponent } from '../../../card-game-core/components/dnd-card-board/dnd-card-board.component';
import { CommonModule } from '@angular/common';
import { CdkDrag, CdkDragHandle, DragDropModule } from '@angular/cdk/drag-drop';
import { CardApiService } from '../../../card-game-core/services/card-api.service';
import { CardComponent } from '../../../card-game-core/components/card/card.component';

@Component({
  selector: 'app-game-room',
  imports: [
    CardEditorComponent, /*DndCardBoardComponent,*/ CommonModule,
    CdkDrag, CdkDragHandle, DragDropModule,
    CardComponent
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
  isCardsMenuOpen: boolean = false;

  private cardApiService = inject(CardApiService);

  cardsMenuDimensions: {width: number, height: number} | undefined = undefined;

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
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  /*
  To ensure that the latest `cardsMenuDimensions` are passed through to your components (``), you need to address the timing issue where the DOM updates and `ngAfterViewChecked` is called. Here’s how you can achieve this:

    ---

    ## **Key Problem**
    The `cardsMenuDimensions` are updated in `ngAfterViewChecked`, but the updated values might not propagate to the child components (``) immediately due to Angular's change detection lifecycle.

    ---

    ## **Solution**

    ### 1. Use Angular's `ChangeDetectorRef`
    You can explicitly trigger change detection after updating `cardsMenuDimensions` using Angular's `ChangeDetectorRef`. This ensures that the new dimensions are propagated to child components.

    ```typescript
    import { ChangeDetectorRef } from '@angular/core';

    export class YourComponent {
      cardsMenuDimensions: { width: number; height: number } = { width: 0, height: 0 };
      shouldUpdateDimensions = true;

      constructor(private cdr: ChangeDetectorRef) {}

      ngAfterViewChecked(): void {
        if (this.shouldUpdateDimensions) {
          const rect = this.getCardsMenuClientRect();

          if (rect.width > 0 && rect.height > 0 && this.cards.length > 0) {
            console.log('Size after view init:', rect.width, rect.height);

            this.cardsMenuDimensions = {
              width: rect.width,
              height: rect.height
            };

            // Trigger change detection to ensure child components get the updated dimensions
            this.cdr.detectChanges();
          }

          this.shouldUpdateDimensions = false;
        }
      }

      getCardsMenuClientRect(): DOMRect {
        const element = document.querySelector('.cards-menu');
        return element ? element.getBoundingClientRect() : new DOMRect(0, 0, 0, 0);
      }
    }
    ```

    ---

    ### 2. Use an `@Input()` Setter in the Child Component
    In ``, use an `@Input()` setter for `parentDimensionsInput`. This allows you to react to changes in the input property and perform any necessary updates.

    ```typescript
    export class AppCardComponent {
      private _parentDimensionsInput: { width: number; height: number } | null = null;

      @Input()
      set parentDimensionsInput(value: { width: number; height: number }) {
        this._parentDimensionsInput = value;
        this.onParentDimensionsChanged();
      }

      get parentDimensionsInput(): { width: number; height: number } | null {
        return this._parentDimensionsInput;
      }

      onParentDimensionsChanged() {
        // Handle logic when dimensions change
        console.log('Updated dimensions:', this._parentDimensionsInput);
      }
    }
    ```

    ---

    ### 3. Use Angular's `trackBy` for Efficient Rendering
    In your template, use Angular's `trackBy` function to optimize rendering and avoid unnecessary DOM destruction/recreation when iterating over the cards.

    ```html

      

    ```

    In your component:

    ```typescript
    trackByCard(index: number, card: any): any {
      return card.id || index; // Use a unique identifier for each card
    }
    ```

    ---

    ### **Explanation of Changes**
    1. **Change Detection Trigger:** Using `ChangeDetectorRef.detectChanges()` ensures that Angular propagates changes to child components immediately.
    2. **Efficient Rendering:** The `trackBy` function prevents unnecessary re-creation of DOM elements, improving performance.
    3. **Reactive Input Handling:** The `@Input()` setter in `` ensures that child components can react dynamically to changes in `cardsMenuDimensions`.

    ---

    ### **Alternative Approach**
    If you want to avoid manual change detection triggers, consider using a reactive approach with an `Observable` or `Subject`. Emit changes to `cardsMenuDimensions` and subscribe to them in child components.

    Let me know if you'd like an example of this approach!

    ---
    Answer from Perplexity: https://www.perplexity.ai/search/div-hidden-iscardsmenuopen-cla-kJTIf8rLRKm8tNISTWzBCQ?utm_source=copy_output
  */
  ngAfterViewChecked(): void {
    if (this.shouldUpdateDimensions) {
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
    }
  }

  getCardsMenuClientRect() {
    // FIXME: Why is nativeElement undefined
    if (this.cardsMenuRef && this.cardsMenuRef.nativeElement) {
      console.log('Get cards menu client rect:', this.cardsMenuRef.nativeElement.getBoundingClientRect().width, this.cardsMenuRef.nativeElement.getBoundingClientRect().height);
      
      return this.cardsMenuRef.nativeElement.getBoundingClientRect();
    }
    return null;
  }

  // TODO: Use the CardApiService or DndCardBoardService to get the cards
  // TODO: Refactor because DndCardBoardService already has it
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

    if (this.isCardsMenuOpen)
      this.shouldUpdateDimensions = true;
    // Let the DOM update
    /*setTimeout(() => {
      let rect = this.getCardsMenuClientRect();

      if (this.isCardsMenuOpen
        && rect.width > 0
        && rect.height > 0) {
        // FIXME: Why 0, 0
        // https://stackoverflow.com/a/57146762
        console.log('Size after view init:', rect.width, rect.height);


        let width: string = `${rect.width}px`;
        let height: string = `${rect.height}px`;

        // FIXME: Why 0,0
        this.cardsMenuDimensions = {
          width: rect.width,
          height: rect.height
        };
      }
    }, 0);*/
  }
}
