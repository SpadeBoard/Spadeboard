import { Component, HostListener, inject, input, output } from '@angular/core';
import { DndCardBoardService } from '../../services/dnd-card-board.service';
import { ActionContextMenuItem } from '../../../actions-context-menu/models/action-context-menu-item';
import { map, Subscription } from 'rxjs';
import { Deck } from '../../models/deck';
import { Card } from '../../models/card';
import { isCard, isDeck } from '../../utils/card-game-core.utils';
import { CdkDragDrop, CdkDragEnter, CdkDragExit, CdkDragMove } from '@angular/cdk/drag-drop';
import { DndFunctionality } from '../../../drag-and-drop/models/dnd-functionality';
import { CardEditorComponent } from '../card-editor/card-editor.component';
import { DisplaceCardMenuComponent } from '../displace-card-menu/displace-card-menu.component';
import { CardFace } from '../../models/card-face';
import { CardFaceElement } from '../../models/card-face-element';

// ROLE: AUTOLOAD

// TODO: FIGURE OUT HIERARCHAL RELATIONSHIP
/************************************************************
app-dnd-card-board (root)          ↑ 
|   app-dnd-wrapper (parent)          | 
|                                                      |
↓     app-card (child)                       | signal up (card)

/*************************************************************/
@Component({
  selector: 'app-dnd-card-board',
  imports: [],
  templateUrl: './dnd-card-board.component.html',
  styleUrl: './dnd-card-board.component.css'
})
export class DndCardBoardComponent implements DndFunctionality {
  private dndCardBoardService: DndCardBoardService = inject(DndCardBoardService);
  
  getBackCardFaceElements(): CardFaceElement[] {
    throw new Error('Method not implemented.');
  }
  getFrontCardFaceElements(): CardFaceElement[] {
    throw new Error('Method not implemented.');
  }
  private _subscription: Subscription = new Subscription();
  
  showActionContextMenu: boolean = false;
  actionContextMenuItems: ActionContextMenuItem[] = [];

  private _items: (Card | Deck)[] = [];
  
  private _currentPopupMenu: number = 0;
  isCurrentPopupMenuOpen: boolean = false;

  private _currentSrcDeckId: number = 0;

  // Goes with dynamic component, whatever dynamic component has these inputs and outputs
  popupMenuInputs = {
    displaceCardMenu: {
      srcDeckId: this._currentSrcDeckId,
      cardsSrcDeck: this.getCardsSrcDeck(this._currentSrcDeckId) ?? [],
      potentialDestDeckIds: this.getDestinationDeckIds(this._currentSrcDeckId) ?? []
    } as {
      srcDeckId: number,
      cardsSrcDeck: Card[], 
      potentialDestDeckIds: number[]
    },
    // TODO: Pass in the potential card face elements as well as front card face and back card face
    cardEditor: {
      card: this.getCard(),
      frontCardFace: this.getFrontCardFace(),
      backCardFace: this.getBackCardFace(),
      frontCardFaceElements: this.getFrontCardFaceElements(),
      backCardFaceElements: this.getBackCardFaceElements()
    } as {
      card: Card,
      frontCardFace: CardFace,
      backCardFace: CardFace,
      frontCardFaceElements: CardFaceElement[],
      backCardFaceElements: CardFaceElement[]
    }
  };

  popupMenuOutputs = {
    amtDisplaceCardsChange: ({ srcDeckId, destDeckId, amt }: { srcDeckId: number, destDeckId: number; amt: number }) => this.handleAmtDisplaceCardsChange(srcDeckId, destDeckId, amt)
  };

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
  };

  backCardFace: CardFace = {
    cardFaceId: 0,
    style: {
      styleId: 0
    }
  };

  frontCardFaceElements: CardFaceElement[] = [];

  backCardFaceElements: CardFaceElement[] = [];

  // TODO: Figure out how to access the children in order to pass that information back to the service

  constructor() {
    // Is going to get triggered everytime adding, deleting, or updating occurs
    this._subscription.add(this.dndCardBoardService.getItems()
    .pipe(
        map((items: (Card | Deck)[]) => items.filter((item:(Card | Deck)) =>
          isDeck(item) || 
          (isCard(item) && this.dndCardBoardService.findDeckFromCard(item.cardId) === null)
        ))
      ).subscribe((filteredItems: (Card | Deck)[]) => {
        console.log('Filtered Items:', filteredItems);
        this._items = filteredItems;
      })
    );
  }

  @HostListener('document:click')
  onDocumentClick() {
    if (this.showActionContextMenu)
      this.showActionContextMenu = false;
  }
  
  ngOnInit() {}

  getCardsFromDeck(item: Deck): Card[] {
    return this.dndCardBoardService.findCardsFromDeck(item, 6);
  }

  // CHECKME
  onCardChange(updatedCard: Card) {
    this.dndCardBoardService.updateCard(updatedCard);
  }

  onDeckChange(updatedDeck: Deck) {
    this.dndCardBoardService.updateDeck(updatedDeck);
  }

  onActionContextMenuItemsChange(newActionContextMenuItems: ActionContextMenuItem[]) {
    this.actionContextMenuItems = newActionContextMenuItems;
    this.showActionContextMenu = true;
  }

  onDragMove(event: CdkDragMove<any>): void {
    this.dndCardBoardService.onDragMove(event);
  }

  onDragEntered(event: CdkDragEnter<any>): void {
    this.dndCardBoardService.onDragEntered(event);
  }

  onDragExited(event: CdkDragExit<any>): void {
    this.dndCardBoardService.onDragExited(event);
  }

  onDragDrop(event: CdkDragDrop<any>): void {
    this.dndCardBoardService.onDragDrop(event);
  }

  onCardEditor() {
    this._currentPopupMenu = 0;
    this.isCurrentPopupMenuOpen = true;

    // TODO: Figure out how to set to false
  }

  onCardEditorChange(card: Card, frontCardFace: CardFace, backCardFace: CardFace, frontCardFaceElements: CardFaceElement[], backCardFaceElements: CardFaceElement[]) {
    this.setCard(card);
    this.setFrontCardFace(frontCardFace);
    this.setBackCardFace(backCardFace);

    this.setFrontCardFaceElements(frontCardFaceElements);
    this.setBackCardFaceElements(backCardFaceElements);
  }

  getCard() {
    return this.card;
  }

  setCard(newCard: Card) {
    this.card = newCard;
  }

  getFrontCardFace() {
    return this.frontCardFace;
  }

  setFrontCardFace(newFrontCard: CardFace) {
    this.frontCardFace = newFrontCard;
  }

  getBackCardFace() {
    return this.backCardFace;
  }

  setBackCardFace(newBackCard: CardFace) {
    this.backCardFace = newBackCard;
  }

  setFrontCardFaceElements(newFrontCardFaceElements: CardFaceElement[]) {
    this.frontCardFaceElements = newFrontCardFaceElements;
  }

  setBackCardFaceElements(newBackCardFaceElements: CardFaceElement[]) {
    this.backCardFaceElements = newBackCardFaceElements;
  }

  onDisplaceCardChange(newCurrentSrcDeckId: number) {
    this._currentSrcDeckId = newCurrentSrcDeckId;
    
    this._currentPopupMenu = 1;
    this.isCurrentPopupMenuOpen = true;
  }

  getCardsSrcDeck(currentSrcDeckId: number): Card[] | null {
    let srcDeck: Deck = {
      zoneId: 0,
      containeeIds: [],
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
    
    let decks: Deck[] | undefined = this.dndCardBoardService.findDecks();
    
    if (decks === undefined)
      return null;

    decks.find((src=> {
      if (src.zoneId === this._currentSrcDeckId)
      {
        srcDeck = src;
        return;
      }
    }));

    return this.dndCardBoardService.findCardsFromDeck(srcDeck);
  }

  getDestinationDeckIds(currentSrcDeckId: number): number[] | null {
    let destDecks: Deck[] | undefined = this.dndCardBoardService.findDecks();
  
    if (destDecks === undefined)
      return null;

    destDecks.filter((dest) => {
      dest.zoneId !== this._currentSrcDeckId;
    });

    let destDecksIds: number[] = [];
    destDecks.forEach(dest=> {
      destDecksIds.push(dest.zoneId);
    });

    return destDecksIds;
  }

  // TODO: https://v17.angular.io/guide/dynamic-component-loader
  // Use this to figure out how to open the various menus
  // TODO: Modify the constructors of these components to pass in things if needed
  // TODO: Figure out how to pass in inputs
  getCurrentPopupMenuComponent() {
    switch(this._currentPopupMenu) {
      case 0:
        // TODO: On open CardEditorComponent, we assign the card in the input to whatever card's being passed in
        return new CardEditorComponent();
      case 1:
        return new DisplaceCardMenuComponent();
      default: // CHECKME: Would this break the page
        return null;
    }
  }

  handleAmtDisplaceCardsChange(srcDeckId: number, destDeckId: number, amt: number) {
    let destDeck: Deck | Card | null = this.dndCardBoardService.findDeck(destDeckId);
    let srcDeck: Deck | Card | null = this.dndCardBoardService.findDeck(srcDeckId);
    
    if (!isDeck(destDeck) || !isDeck(srcDeck))
      return;

    this.dndCardBoardService.displaceCards(srcDeck, destDeck, amt);

    this.dndCardBoardService.updateDeck(srcDeck);
    this.dndCardBoardService.updateDeck(destDeck);
  }

  ngOnDestroy() {
    if (this._subscription) {
      this._subscription.unsubscribe();
    }
  }
}
