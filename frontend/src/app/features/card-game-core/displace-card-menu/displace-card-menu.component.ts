import { CdkDragDrop, CdkDragEnter, CdkDragExit, CdkDragMove, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, input, output } from '@angular/core';
import { ActionContextMenuItem } from '../../../shared/actions/models/action-context-menu-item';
import { clamp } from '../../../utils/utils';
import { DndDragBoundary } from '../../drag-and-drop/models/dnd-drag-boundary';
import { Style } from '../../style/models/style';
import { CardComponent } from '../card/components/core/card.component';
import { Card } from '../card/models/card';

@Component({
  selector: 'app-displace-card-menu',
  host: {
    '(document:click)': 'onDocumenClick()'
  },
  imports: [CardComponent],
  templateUrl: './displace-card-menu.component.html',
  styleUrl: './displace-card-menu.component.scss'
})
export class DisplaceCardMenuComponent {
  // TODO: Pass in the decks via the constructor, get the current deck ID
  // Then grab the cards
  // Then decide to move them to the destination deck
  // TODO: Only render the top cards of the deck that you want to grab and do it dynamically
  public cardsToRender: Card[] = [];

  public displaceCardMenu = input<{srcDeckId: number, cardsSrcDeck: Card[], potentialDestDeckIds: number[]}>();

  // TODO: // This matches the 'key in componentOutputs of the parent
  private _destDeckId: number = 0;
  amtDisplaceCards: number = 0;
  amtDisplaceCardsChange = output<{srcDeckId: number, destDeckId: number, amt: number}>();

  showActionContextMenu: boolean = false;
  actionContextMenuItems: ActionContextMenuItem[] = [];

  // TODO: Refactor, just use inputs
  constructor() {
    // TODO: Set the styling of each of the cards in cardsSrcDeck
  }

  onDocumentClick() {
    if (this.showActionContextMenu)
      this.showActionContextMenu = false;
  }

  setCardsToRender(newAmt: number) {
    let amt = clamp(newAmt, 0, 6);


    // TODO: Loop backwards, use reverse
    let reverse = this.displaceCardMenu()?.cardsSrcDeck.reverse();
    
    if (reverse === undefined)
      return;
    
    for (let i: number = 0; i < amt; i++) {
      let card = reverse[i];

      /*if (!card.dndItem.style || !card.dndItem.style || !card.dndItem.style.width || !card.dndItem.style.height)
        return;

      // CHECKME: This should work, set the width and height to empty strings
      card.dndItem.style.aspectRatio = convertToRelativeDimensions({width: card.dndItem.style.width, height: card.dndItem.style.height});
      card.dndItem.style.width = '';
      card.dndItem.style.height = '';*/

      this.cardsToRender.push(card);
    }
  }

  onDragMove(event: CdkDragMove<any>) {

  }

  onDragEntered(event: CdkDragEnter<any>) {

  }

  onDragDrop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.cardsToRender, event.previousIndex, event.currentIndex);
  }

  onDragExited(event: CdkDragExit<any>) {

  }

  // PURPOSE: This is to make sure it passes back down to app card to render properly
  onCardChange(updatedCard: Card) {
    this.displaceCardMenu()?.cardsSrcDeck.find(card => {
      if (card.cardId === updatedCard.cardId) {
        card = updatedCard;
        return;
      }
    });
  }

  // TODO: Allow the user to flip the card
  onActionContextMenuItemsChange(newActionContextMenuItems: ActionContextMenuItem[]) {
    this.actionContextMenuItems = newActionContextMenuItems;
    this.showActionContextMenu = true;
  }

  /*https://stackblitz.com/edit/angular-cards-stack-dynamics?file=app%2Fstack%2Fstack.component.ts*/
  /*Question is how do you calculate the styling per dynamic children*/

  /*
  So figure this out in the TS?
  .card-stack > *:nth-child(1) { transform: translateY(0); }
  .card-stack > *:nth-child(2) { transform: translateY(30px); }
  .card-stack > *:nth-child(3) { transform: translateY(60px); }
  .card-stack > *:nth-child(4) { transform: translateY(90px); }
  */

  getCardStackDropListStyle(): Omit<Style, 'styleId'> {
    return {
      width: "100%",
      maxWidth: "100%",
      border: "solid 1px #ccc",
      minHeight: "50%",
      display: "flex",
      background: "white",
      borderRadius: "4px",
      overflow: "hidden"
    };
  }

  // CHECKME: Should be 100% of the parent
  getDragBoundary(): DndDragBoundary {
    let style = this.getCardStackDropListStyle();

    return {
      width: (style.width) ? style.width : "100%",
      height: (style.height) ? style.height : "100%"
    }
  }

  setCardInStackStyle(initialStyle: Style, index: number): void {
    let initialTranslateY: number = 30;

    // Set the transform in here based on the index of it, multiple it by initialTranslateY
    // Is a reference so shouldn't need to reassign it
    initialStyle = {
      ...initialStyle,
      transform: `translateY(${initialTranslateY * (index + 1)})`
    }
  }

  onAmtDisplaceCardsChange(event: Event) {
    let value = (event.target as HTMLInputElement).value;

    // Remove any non-digit characters
    let sanitizedValue = value.replace(/[^0-9]/g, '');

    let cardsSrcDeckLength: number | undefined = this.displaceCardMenu()?.cardsSrcDeck.length;

    if (cardsSrcDeckLength === undefined)
      return;

    // Convert to number and update the property
    this.amtDisplaceCards = clamp(sanitizedValue ? parseInt(sanitizedValue, 10) : 0, 0, cardsSrcDeckLength);

    // TODO: Above max, set the value to max
    (event.target as HTMLInputElement).value = this.amtDisplaceCards.toString();

    this.setCardsToRender(this.amtDisplaceCards);
  }

  // Render based on those
  // Session data?

  onDestDeckChange(event: Event) 
  {
    let value = (event.target as HTMLInputElement).value;

    // Remove any non-digit characters
    let sanitizedValue = value.replace(/[^0-9]/g, '');

    // Convert to number and update the property
    this._destDeckId= parseInt(sanitizedValue);
  }


  // TODO: Figure out how to pass this information back up
  onDisplace(event: Event) {
    this.amtDisplaceCardsChange.emit({
      srcDeckId: this.displaceCardMenu()?.srcDeckId ?? -1,
      destDeckId: this._destDeckId,
      amt: this.amtDisplaceCards
    });
  }
}
