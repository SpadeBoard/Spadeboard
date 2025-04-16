```mermaid
---
title: Animal example
---
classDiagram
    class DndBoardComponent {
        <<component>>
    }
    note for DndCardBoard "Root"
    class DndBoardService {
        <<injectable>>
        - _gameRoomId: number
        - _items: BehaviorSubject<(Card | Deck)[]> 
        - <<get/set>>_showActionContextMenu: BehaviorSubject<boolean>= false
        - <<get/set>> _actionContextMenuItems: BehaviorSubject<ActionContextMenuItem[]>= []
        + getCards(): Card[] | undefined
        + updateCard(newCard: Card): void
        + findCard(cardId: number): Card | null
        + findCardsFromDeck(deck: Deck, returnAmt?: number): Card[]
        + createDeck(): Deck
        + createDeck(cards: Card[]): Deck
        + createDeck(srcCard: Card, destCard: Card): Deck
        + createDeck(srcCard?: Card | Card[], destCard?: Card): Deck
        + displaceCards(srcDeck: Deck, destDeck: Deck, amt: number): void
        + displaceCards(srcDeck: Deck, destDeck: Deck, fromSrc?: number, toSrc?: number): void
        + displaceCards(srcDeck: Deck, destDeck: Deck, fromDest?: number): void
        + displaceCards(srcDeck: Deck, destDeck: Deck, amt?: number, fromSrc?: number, toSrc?: number, fromDest?: number): void
        + findDeckFromCard(cardId: number): Deck | null
        + deleteDeck(id: number): void;
        + deleteDeck(ids: number[]): void;
        + deleteDeck(id: number | number[]): void
        + removeFromDecks(deckId: number): void
        + removeCardFromDeck(cardId: number): boolean
        + onDragMove(event: CdkDragMove<any>): void
        + onDragExited(event: CdkDragExit<any>): void
        + onDragEntered(event: CdkDragEnter<any>): void
        + onDragDrop(event: CdkDragDrop<any>): void
    }
    DndBoardService --|> DndFunctionality
    
    class DndComponent {
        <<component>>
        - _dndItemPosition: Position
        + itemData: any @input
        + style: Style @input
        + DndComponent(- dndFunctionalityImpl: any): void
        + onDrag(event: CdkDragMove<any>): void
        + onDragEntered(event: CdkDragEnter<any>): void
        + onDrop(event: CdkDragDrop<any>): void
    }
    class Position {
        <<type>>
        top: number,
        bottom: number.
        left: number.
        right: number
    }
    note for DndComponent "this should be the child of card and deck and then signal up or call the service directly on drag, drag entered, etc."
    note for DndComponent "can't pass in Service class directly, use any"
    note for DndFunctionality "instead of inheritance, use interfaces? Implement the functions that way"
    
    class Resizable {
        <<component>>
        + isResizable = false @input
        + parentWidth: number = 0 @input
        + parentHeight: number = 0 @input
        + parentDimensionsChange: {x: number, y: number} @output
        - _parentStartWidth: number = 0;
        - _parentStartHeight: number = 0;
        - _parentStartX: number = 0;
        - _parentStartY: number = 0;
        - _newParentWidth: number = 0;
        - _newParentHeight: number = 0;
        + onResizeStart(event: MouseEvent): void
        + onMouseMove(event: MouseEvent): void
        + onMouseUp(): void
    }
    note for Resizable "make handle bars at the corners of the item you're resizing"
    note for Resizable "make a subscription where Resizable is always subscribed to the parent to always get the latest up to date width and height"
    note for Resizable "onMouseMove should send signals back up to the parent"
    
    class DndFunctionality {
        <<interface>>
        + onDrag(event: CdkDragMove<any>): void
        + onDragExited(event: CdkDragEnter<any>): void
        + onDrop(event: CdkDragDrop<any>): void
    }

    class CardComponent {
        <<component>>
    }
    class DeckComponent {
        <<component>>
    }
    DndBoardComponent --o DndBoardService : uses

    note for DndBoardService  "Service"
    note for DndBoardService  "Autoload"
    note for DndBoardService  "Singleton"

    note for CardComponent "Parent"
    note for DndComponent "Child"
```