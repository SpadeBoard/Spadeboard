import { Component, input, InputSignal, output, OutputEmitterRef } from '@angular/core';

import { Deck } from '../models/deck';
import { fisherYatesShuffle } from '../../utils/shuffle-algorithms.utils';

import { ActionContextMenuItem } from '../../../../shared/actions/models/action-context-menu-item';
import { shuffleAnimation } from './deck.animations';

@Component({
  selector: 'app-deck',
  imports: [],
  templateUrl: './deck.component.html',
  styleUrl: './deck.component.scss',
  animations: [shuffleAnimation] // TODO: Use shuffleAnimation when you're shuffling, probably have a button to handle that
})
export class DeckComponent {
  public readonly $deck: InputSignal<Deck> = input<Deck>({
    zoneId: -1,
    containeeIds: [], // CHECKME: When opening displace menu, make sure that you actually grab the card containee ids then render the cards in there if needed
    maxChildren: 52, // CHECKME: Set max children, then unset max children, does it stiill work

    dndItemId: "-1",
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
    },
    isRotatable: false
  });

  public $deckChange: OutputEmitterRef<Deck> = output<Deck>();

  protected actionContextMenuItems: ActionContextMenuItem[] = [
    {
      id: 0,
      name: "Shuffle",
      action: this.onShuffle,
      disabled: false
    },
    {
      id: 1,
      name: "Displace card",
      action: this.onDisplaceCard,
      disabled: false
    }
  ];

  public $actionContextMenuItemsChange: OutputEmitterRef<ActionContextMenuItem[]> = output<ActionContextMenuItem[]>();

  // Pass back the current src $deck ID
  public $onDisplaceCardChange: OutputEmitterRef<number> = output<number>();

  /********* TO BE REFACTORED ************ */
  protected onRightClick(event: MouseEvent): void {
    event.preventDefault();
    
    // TODO: Potentially pass in the menu's location?
    /*
    event.clientX;
    event.clientY;
    */

    this.$actionContextMenuItemsChange.emit(this.actionContextMenuItems);
  }
  /*********************************/

  constructor (){}

  private setDeckStyle(): void {}

  // TODO: If amount of containee Ids exceeds max children, then toggle off droppability
  // Check this every time a card is about to be added
  private hasReachedMaxCards(): boolean {
    let maxChildren: number | undefined = this.$deck().maxChildren;

    if (!maxChildren) return false;
    return (this.$deck().containeeIds.length >= maxChildren)
  }

  // TODO: Bind this function to an action context menu, use ActionContextMenu
  private onShuffle(): void {
    if (this.$deck().containeeIds.length == 0)
      return;

    this.$deck().containeeIds = fisherYatesShuffle(this.$deck().containeeIds);
  }

  private onDisplaceCard(): void {
    this.$onDisplaceCardChange.emit(this.$deck().zoneId);
  }
}
