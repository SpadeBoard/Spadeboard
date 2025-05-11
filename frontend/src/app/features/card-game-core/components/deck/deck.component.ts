import { Component, input, output } from '@angular/core';

import { Deck } from '../../models/deck';
import { fisherYatesShuffle } from '../../utils/shuffle-algorithms.utils';

import { DndContentDirective } from '../../../drag-and-drop/directives/dnd-content.directive';

import { DndBoardService } from '../../../drag-and-drop/services/dnd-board.service';

import { shuffleAnimation } from './deck.animations';
import { ActionContextMenuItem } from '../../../actions-context-menu/models/action-context-menu-item';
import { DndResizableContainerComponent } from '../../../drag-and-drop/components/dnd-resizable-container - DISCARD/dnd-resizable-container.component';

@Component({
  selector: 'app-deck',
  imports: [
    DndContentDirective, DndResizableContainerComponent
  ],
  templateUrl: './deck.component.html',
  styleUrl: './deck.component.css',
  animations: [shuffleAnimation] // TODO: Use shuffleAnimation when you're shuffling, probably have a button to handle that
})
export class DeckComponent {
  deck = input<Deck>({
    zoneId: -1,
    containeeIds: [], // CHECKME: When opening displace menu, make sure that you actually grab the card containee ids then render the cards in there if needed
    maxChildren: 52, // CHECKME: Set max children, then unset max children, does it stiill work

    dndItemId: -1,
    isDraggable: false,
    isDroppable: false,
    dndPosition: {
      x: 0, y: 0,
      dndPositionId: "0"
    },

    style: {
      styleId: "0",
      height: '',
      width: '',
      margin: '50'
    }
  });

  deckChange = output<Deck>();

  actionContextMenuItems: ActionContextMenuItem[] = [
    {
      id: 0,
      name: "Shuffle",
      action: this.onShuffle
    },
    {
      id: 1,
      name: "Displace card",
      action: this.onDisplaceCard
    }
  ];

  actionContextMenuItemsChange = output<ActionContextMenuItem[]>();

  // Pass back the current src deck ID
  onDisplaceCardChange = output<number>();

  /********* TO BE REFACTORED ************ */
  onRightClick(event: MouseEvent) {
    event.preventDefault();
    
    // TODO: Potentially pass in the menu's location?
    /*
    event.clientX;
    event.clientY;
    */

    this.actionContextMenuItemsChange.emit(this.actionContextMenuItems);
  }
  /*********************************/

  constructor (private dndBoardService: DndBoardService){
  }

  setDeckStyle(): void {

  }

  // TODO: If amount of containee Ids exceeds max children, then toggle off droppability
  // Check this every time a card is about to be added
  hasReachedMaxCards(): boolean {
    let maxChildren: number | undefined = this.deck().maxChildren;

    if (maxChildren === undefined)
      return false;

    return (this.deck().containeeIds.length >= maxChildren)
  }

  // TODO: Bind this function to an action context menu, use ActionContextMenu
  onShuffle() {
    if (this.deck().containeeIds.length == 0)
      return;

    this.deck().containeeIds = fisherYatesShuffle(this.deck().containeeIds);
  }

  onDisplaceCard() {
    this.onDisplaceCardChange.emit(this.deck().zoneId);
  }
}
