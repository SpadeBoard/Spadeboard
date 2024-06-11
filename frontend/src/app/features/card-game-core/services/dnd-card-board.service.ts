import { Injectable, HostListener, inject } from '@angular/core';

import { DndContainmentService } from '../../drag-and-drop/services/dnd-containment.service';

import { Card } from '../models/card';
import { Deck } from '../models/deck';
// import { DndItem } from '../../drag-and-drop/models/dnd-itemCardOrDeck';

import { CdkDragDrop, CdkDragEnter, CdkDragExit, CdkDragMove, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { CardApiService } from './card-api.service';
import { DeckComponent } from '../components/deck/deck.component';
import { CardComponent } from '../components/card/card.component';
import { ActionContextMenuItem } from '../../actions-context-menu/models/action-context-menu-item';
import { BehaviorSubject, Observable } from 'rxjs';
import { isCard, isDeck } from '../utils/card-game-core.utils';

import {DndFunctionality } from '../../drag-and-drop/models/dnd-functionality';
// REFERENCE: https://chatgpt.com/share/67aa3584-5cb0-800c-89a4-33088e3a0671
// Potential example of how to achieve what we wanted
/*
interface MyInterface {
      myMethod(): void;
    }

    class MyClass {
      myMethod() {
        // Implementation
      }
    }

  let instance: MyInterface = new MyClass(); // Valid, because MyClass has myMethod()
*/

@Injectable({
  providedIn: 'root'
})
export class DndCardBoardService implements DndFunctionality {
  // TODO: Replace with game room ID
  gameRoomId: number = 0;
  ownerId: string = "5811e387-1551-4090-9485-a3ebe30efb5a"; // TODO: Create user and replace owner ID

  // TODO: Batch all of these API services together and cause those instead

  // TODO: Merge cards and decks into one
  _items: BehaviorSubject<(Card | Deck)[]> = new BehaviorSubject<(Card | Deck)[]>([]);;

  private cardApiService = inject(CardApiService);
  private dndContainmentService = inject(DndContainmentService);
  
  // TODO: Remove these API Services, and use a batch API service
  constructor() { }

  ngOnInit() {
    // TODO: Batch query, return an object of card array, deck array, and dnd itemCardOrDeck array
    let cards: Card[] | undefined = this.getCards();

    if (cards !== undefined)
      this._items.getValue().push(...cards);
  }

  // TODO: Placeholder for detecting exit application to then batch update the cards, dnd _items, and decks
  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: BeforeUnloadEvent) {
    // Perform any cleanup or confirmation logic here
    // For example, you can prompt the user with a confirmation message

    // TODO: Batch update to the database
    // What we need to do is defaultly update so that every user in the room has a copy of the cards and decks
  }


  /********************** ITEMS ************************/
  getItems(): Observable<(Card | Deck)[]> {
    return this._items.asObservable();
  }

  // TODO: Call the API services to set the items

  /***********************************************/

  // Reference: https://www.angularspace.com/creating-custom-rxresource-api-with-observables/
  getCards(): Card[] | undefined {
    let cards: Card[] | undefined =  undefined;
    this.cardApiService.getCards(
      this.ownerId).subscribe((result: Card[] | undefined) => {
        cards = result;
    });
    
    return cards;
  }

  getDecks(): Deck[] {
    throw new Error('Method not implemented.');
  }

  findCard(cardId: number): Card | Deck | null {
    return this._items.getValue().find(card => (isCard(card) && card.cardId === cardId)) || null;
  }

  updateCard(newCard: Card) {
    let currentItems: (Card | Deck)[] = this._items.getValue();
    let updatedItems: (Card | Deck)[] = currentItems.map((item) => {
      if (isCard(item) && item.cardId === newCard.cardId) {
        return newCard;
      }
      return item;
    });
    this._items.next(updatedItems);
  }

  // TODO: Find deck from card - this should be a static function accessible anywhere, make a service for drag and drop
  findDeckFromCard(cardId: number): Deck | null {
    let deck: Deck | null = null;

    this._items.getValue().forEach((d) => {
      if (isDeck(d) && this.dndContainmentService.getContainerFromContainee(cardId, d.containeeIds) != null) {
        deck = d;
        return;
      }
    });

    return deck;
  }

  findCardsFromDeck(deck: Deck, returnAmtFromTop?: number): Card[] {
    let cards: Card[] = [];

    if (returnAmtFromTop !== undefined) {
      let containeeIds = deck.containeeIds.slice().reverse();
      containeeIds = containeeIds.slice(0, returnAmtFromTop);

      for (let id of containeeIds) {
        let match: Card | Deck | undefined = this._items.getValue().find(card => isCard(card) && card.cardId === id);
  
        if (match && isCard(match)) {
          cards.push(match);
        }
      }

      return cards;
    }

    for (let id of deck.containeeIds) {
      let match: Card | Deck | undefined = this._items.getValue().find(card => isCard(card) && card.cardId === id);

      if (match && isCard(match)) {
        cards.push(match);
      }
    }

    return cards;
  }

  // TODO: Move multiple cards to a new deck. fromSrc is the card's index, amt is the amount of cards starting from the length of the deck
  // TODO: Move this to the displace cards menu?
  displaceCards(srcDeck: Deck, destDeck: Deck, amt: number): void;
  displaceCards(srcDeck: Deck, destDeck: Deck, fromSrc?: number, toSrc?: number): void;
  displaceCards(srcDeck: Deck, destDeck: Deck, fromDest?: number): void;
  displaceCards(srcDeck: Deck, destDeck: Deck, amt?: number, fromSrc?: number, toSrc?: number, fromDest?: number): void {
    let cardsToTransfer: number[] = [];

    // TODO: Gotta rewrite this with guard clauses
    if (fromSrc != undefined) {
      // CHECKME: Need a check to make sure toSrc can't be higher than srcDeck's length?
      toSrc = toSrc ?? srcDeck.containeeIds.length;

      cardsToTransfer = srcDeck.containeeIds.slice(fromSrc, toSrc);

      if (fromDest == undefined) {
        destDeck.containeeIds.push(...cardsToTransfer);
        return;
      }

      destDeck.containeeIds.splice(fromDest, 0, ...cardsToTransfer);
      return;
    }

    amt = amt ?? 1;

    for (let i = 0; i < amt && srcDeck.containeeIds.length > 0; i++) {
      let card: number | undefined = srcDeck.containeeIds.pop();

      if (card !== undefined) {
        cardsToTransfer.push(card);
      }
    }

    // No range of cards to transfer, transfer the top one to the destination deck
    destDeck.containeeIds.push(...cardsToTransfer);
  }

  // TODO: Disable card droppability when in deck, you just want to be able to drag it outside of the deck


  findDeck(deckId: number): Deck | Card | null {
    return this._items.getValue().find(deck=> (isDeck(deck) && deck.zoneId === deckId)) || null;
  }

  // TODO: Create deck via a menu
  // TODO: Cards on top of each other auto creates a new deck
  createDeck(): Deck;
  createDeck(cards: Card[]): Deck;
  createDeck(srcCard: Card, destCard: Card): Deck;
  createDeck(srcCard?: Card | Card[], destCard?: Card): Deck {
    let deck: Deck = {
      zoneId: this._items.getValue().length + 1,
      style: {
        styleId: 0,
      },
      containeeIds: [],

      dndItemId: this._items.getValue().length + 1,
      isDraggable: true,
      isDroppable: true,
      dndPosition: (!destCard || destCard.dndItem === undefined|| destCard.dndItem.dndPosition === undefined) ? { x: 0, y: 0 } : destCard.dndItem.dndPosition,
    };

    // ADDINGS CARDS TO ONE DECK
    if (Array.isArray(srcCard)) {
      // Logic for creating a deck from an array of cards
      deck.containeeIds = srcCard.map(card => card.cardId);
      return deck;
    }

    // ADDING TWO CARDS TO MAKE A NEW DECK
    if (srcCard && destCard) {
      deck.containeeIds = [srcCard.cardId, destCard.cardId];
      return deck;
    }

    return deck;
  }

  // TODO: When decks overlap, they merge into one
  mergeDecks(srcDeck: Deck, destDeck: Deck): Deck {
    let merged: Deck = {
      zoneId: this._items.getValue().length + 1,
      style: {
        styleId: 0,
      },
      containeeIds: [],

      dndItemId: this._items.getValue().length + 1,
      isDraggable: true,
      isDroppable: true,
      dndPosition: destDeck.dndPosition,
    };

    merged.containeeIds = [
      ...srcDeck.containeeIds,
      ...destDeck.containeeIds
    ];

    return merged;
  }

  updateDeck(newDeck: Deck): void {
    let currentItems = this._items.getValue();
    let updatedItems = currentItems.map((item) => {
      if (isDeck(item) && item.zoneId === newDeck.zoneId) {
        return newDeck;
      }
      return item;
    });

    this._items.next(updatedItems);
  }

  deleteDeck(id: number): void;
  deleteDeck(ids: number[]): void;
  deleteDeck(id: number | number[]): void {
    if (typeof id !== 'number' && !Array.isArray(id))
      return;

    // List of decks
    if (Array.isArray(id)) {
      id.forEach(element => {
        this.removeFromDecks(element);
      });

      return;
    }

    // Just one deck
    this.removeFromDecks(id);
  }

  removeFromDecks(deckId: number) {
    this._items.next(this._items.getValue().filter(deck => isDeck(deck) && deck.zoneId !== deckId));
  }

  removeCardFromDeck(cardId: number): boolean {
    let deck: Deck | null = this.findDeckFromCard(cardId);

    if (!isDeck(deck) || deck == null)
      return false;

    let idx = deck.containeeIds.indexOf(cardId);

    if (idx > -1) {
      deck.containeeIds.splice(idx, 1);
      this.updateDeck(deck);
      return true;
    }

    return false;
  }

  findDecks(): Deck[] | undefined {
    return this._items.getValue().filter(item => isDeck(item));
  }

  // TODO: Use this service to handle the drag and drop functionality and override it all
  // Question is, how?
  onDragMove(event: CdkDragMove<any>) {
    // Custom drag logic
  }

  onDragEntered(event: CdkDragEnter<any>) {
    // Custom drag enter logic
  }

  // FIXME: GRAB THE CHILDREN OF THE ITEM, ITEM ITSELF IS DndItem

  /*
  To check if the child of <app-dnd-itemCardOrDeck> is a card in your onDragExited method, you can use Angular's ContentChild decorator along with the AfterContentInit lifecycle hook. Here's how you can modify your code to achieve this:

1. First, update your app-dnd-itemCardOrDeck component to use ContentChild:

```typescript
import { Component, ContentChild, AfterContentInit } from '@angular/core';
import { CardComponent } from './card.component';

@Component({
  selector: 'app-dnd-itemCardOrDeck',
  // ... other component metadata
})
export class DndItemComponent implements AfterContentInit {
  @ContentChild(CardComponent) cardComponent: CardComponent | undefined;

  ngAfterContentInit() {
    // The cardComponent will be available here if it exists
  }
}
```

2. Now, in your onDragExited method, you can check if the draggedCard itemCardOrDeck has a card component:

```typescript
onDragExited(event: CdkDragExit<any>) {
  const dndItem = event.itemCardOrDeck.data as DndItemComponent;
  
  if (dndItem.cardComponent) {
    // This is a card
    const card = dndItem.cardComponent.card;
    card;
  } else {
    // This is not a card
    return;
  }
}
```

This approach allows you to check if the child of <app-dnd-itemCardOrDeck> is a card without needing to modify the structure of your components. The ContentChild decorator will give you access to the CardComponent if it exists within the DndItemComponent[1][4].

To make this work, ensure that your CardComponent is properly exported and imported where it's used. Also, make sure that the DndItemComponent is correctly typed in your event.itemCardOrDeck.data.

This method provides a more Angular-centric way of checking the child component type, rather than relying on a custom isCard method[8].

Citations:
[1] https://www.reddit.com/r/Angular2/comments/14i9blz/how_to_check_if_a_component_received_no_child/
[2] https://stackoverflow.com/questions/47796638/angular-5-testing-how-to-get-a-reference-to-the-child-component
[3] https://www.linkedin.com/pulse/quick-guide-get-child-component-from-your-angular-test-den-braber-
[4] https://craft.centric.eu/blog/cloud/angular-components-how-to-talk-to-your-children-and-listen-to-what-they-have-to-say-part-1/
[5] https://angular.dev/guide/components/queries/
[6] https://material.angular.io/guide/using-component-harnesses
[7] https://www.youtube.com/watch?v=9qVot8rMasU
[8] https://angular.io/guide/inputs-outputs

---
Answer from Perplexity: https://www.perplexity.ai/search/in-angular-cdk-how-do-i-check-M0B2cuUeSt6cFjMSY5i9pw?utm_source=copy_output
  */
  // Assumptions:
  // Cards in decks should not be droppable
  // Only cards can be dragged outside of decks
  // Cards and decks extend off of dnd item
  // There is no drag boundary
  // It'll always be the top card that's being dragged

  // FIXME: 
  // If adding a card to a deck, we should have a context menu popping up giving that option
  // Same thing with adding two cards together
  onDragDrop(event: CdkDragDrop<any>) {
    let itemCardOrDeck: Card | Deck = (event.item.data.card()) ? event.item.data.card() : event.item.data.deck() as Card | Deck;
    /******************** REMOVE ********************** */
    if (!event.isPointerOverContainer) {
      // CARDS CAN BE REMOVED, NO NEED TO WORRY ABOUT DECKS
      if (!isCard(itemCardOrDeck))
        return;

      this.removeCardFromDeck(itemCardOrDeck.cardId);
      return;
    }

    /************************** ADDING ************************** */
    // TODO: Bind cdkDrag [cdkDragData] and cdkDropList [cdkDropListData]
    // CHECKME
    let previousContainerDeckComponent: DeckComponent = event.previousContainer.data;
    let previousContainerDeck: Deck = previousContainerDeckComponent.deck() as Deck;

    let containerCardOrDeckComponent: DeckComponent | CardComponent = event.container.data as DeckComponent | CardComponent;
    let containerCardOrDeck: Card | Deck = (containerCardOrDeckComponent instanceof DeckComponent) ? containerCardOrDeckComponent.deck() as Deck : containerCardOrDeckComponent.card() as Card;
    /*************************************/

    // IF CARD ON CARD
    if (isCard(itemCardOrDeck) && isCard(containerCardOrDeck)) {
      // CARD DRAGGED FROM IS ALREADY IN DECK
      if (isDeck(previousContainerDeck)) {
        let idx = previousContainerDeck.containeeIds.indexOf(itemCardOrDeck.cardId);

        if (idx > -1) {
          previousContainerDeck.containeeIds.splice(idx, 1);
          this.updateDeck(previousContainerDeck);
        }
      }

      /********************* MERGE CARDS TOGETHER **************************/
      let draggedCard: Card | Deck | null = this.findCard(itemCardOrDeck.cardId);
      let droppedCard: Card | Deck | null = this.findCard(containerCardOrDeck.cardId);

      // CHECKME: Rewrite this to use guard clauses
      if (draggedCard === null
        || !isCard(draggedCard)
        || droppedCard === null
        || !isCard(droppedCard)
        || !draggedCard.dndItem
        || !droppedCard.dndItem)
        return;

      // TODO: Set the positions of the _items, defaultly or here

      /**************** FIXME: Setting droppability of item to false should be handled defaultly ***********************/
      draggedCard.dndItem.isDroppable = false;
      draggedCard.dndItem.dndPosition = event.dropPoint;
      this.updateCard(draggedCard);

      droppedCard.dndItem.isDroppable = false;
      this.updateCard(droppedCard);

      this._items.getValue().push(this.createDeck(draggedCard, droppedCard));
      return;
      /***************************************************/
    }

    // IF CARD IN MOVES TO DECK
    if (isCard(itemCardOrDeck) && isDeck(containerCardOrDeck)) {
      let draggedCard: Card | Deck | null = this.findCard(itemCardOrDeck.cardId);

      if (!draggedCard || !isCard(draggedCard) || !draggedCard.dndItem)
        return;

      draggedCard.dndItem.dndPosition = event.dropPoint;
      this.updateCard(draggedCard);

      // CARD IS IN DECK
      if (isDeck(previousContainerDeck) && !previousContainerDeckComponent.hasReachedMaxCards()) {
        transferArrayItem(previousContainerDeck.containeeIds, containerCardOrDeck.containeeIds, event.previousIndex, event.currentIndex);
        return;
      }

      // STANDALONE CARD
      containerCardOrDeck.containeeIds.push(itemCardOrDeck.cardId);
      return;
    }

    // IF DECK OVERLAPS DECK
    if (isDeck(itemCardOrDeck) && isDeck(containerCardOrDeck)) {
      this._items.getValue().push(this.mergeDecks(itemCardOrDeck, containerCardOrDeck));
      this.deleteDeck([itemCardOrDeck.zoneId, containerCardOrDeck.zoneId]);
    }
  }

  onDragExited(event: CdkDragExit<any>) {
    // TODO: Grab the data associated with the event, then find the deck associated with that and remove it
    /*
      NOTE: The items are for everything, on exit, remove the references from the deck
      Deck has containee IDs which are for the cards
      Each deck should probably be its own droplist, and when it's a deck, make a cdkDroplist around it
      That probably means that there needs to be a drop list group
      Another array for decks(?)
      https://material.angular.io/cdk/drag-drop/overview#cdk-drag-drop-connected-sorting-group
    */

    // REFERENCE: Potentially how it could be handled?
    /*
    To remove an itemCardOrDeck from a drop list when it's draggedCard outside in Angular CDK, you can use the `cdkDropListExited` event in combination with array manipulation. Here's how you can achieve this:

  1. Add the `cdkDropListExited` event to your drop list:

  ```html
  <div cdkDropList
      (cdkDropListDropped)="drop($event)"
      (cdkDropListExited)="exited($event)">
    <!-- Your list _items here -->
  </div>
  ```

  2. Implement the `exited` method in your component:

  ```typescript
  import { CdkDragExit } from '@angular/cdk/drag-drop';

  exited(event: CdkDragExit<any>) {
    const itemIndex = this._items.indexOf(event.itemCardOrDeck.data);
    if (itemIndex > -1) {
      this._items.splice(itemIndex, 1);
    }
  }
  ```

  This approach will remove the itemCardOrDeck from the array when it's draggedCard outside the drop list[5]. However, be cautious as this will immediately remove the itemCardOrDeck from the list, which might not always be the desired behavior.

  If you want to remove the itemCardOrDeck only when it's droppedCard outside, you can use a combination of `cdkDropListExited` and `cdkDropListDropped` events:

  1. Mark the itemCardOrDeck for removal in the `exited` method:

  ```typescript
  exited(event: CdkDragExit<any>) {
    event.itemCardOrDeck.data._markedForRemoval = true;
  }
  ```

  2. Remove the itemCardOrDeck in the `drop` method if it's marked for removal:

  ```typescript
  drop(event: CdkDragDrop<any[]>) {
    if (event.itemCardOrDeck.data._markedForRemoval) {
      const itemIndex = this._items.indexOf(event.itemCardOrDeck.data);
      if (itemIndex > -1) {
        this._items.splice(itemIndex, 1);
      }
    }
    // Your existing drop logic here
  }
  ```

  This approach ensures that the itemCardOrDeck is only removed when it's actually droppedCard outside the list, giving you more control over the drag-and-drop behavior[1][5].

  Citations:
  [1] https://stackoverflow.com/questions/60182400/angular-material-drag-n-drop-cdk-remove-element-on-list
  [2] https://www.reddit.com/r/Angular2/comments/16w6yd5/angular_cdk_dragdrop_slot_content_is_not_visible/
  [3] https://www.thisdot.co/blog/angular-cdk-sorting-_items-using-drag-and-drop
  [4] https://www.reddit.com/r/Angular2/comments/hvzhnw/help_with_cdk_drag_and_drop_to_add_to_list_not/
  [5] https://github.com/angular/components/issues/20194
  [6] https://material.angular.io/cdk/drag-drop
  [7] https://material.angular.io/cdk/drag-drop/api
  [8] https://github.com/angular/components/issues/13100

  ---
  Answer from Perplexity: https://www.perplexity.ai/search/in-angular-how-do-you-pass-a-f-QZRTJGPeQySeESn0g_ilvw?utm_source=copy_output
  */
  }
}
