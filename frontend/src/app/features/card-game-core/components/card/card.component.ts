import { Component, Signal, viewChildren, output, input, inject, effect, computed, SimpleChanges, InputSignal, Input } from '@angular/core';

import { Card } from '../../models/card';
import { cardFlipAnimation } from './card.animations';

import { DndBoardService } from '../../../drag-and-drop/services/dnd-board.service';
import { DndContentDirective } from '../../../drag-and-drop/directives/dnd-content.directive';
import { ActionContextMenuItem } from '../../../actions-context-menu/models/action-context-menu-item';

import { Style } from '../../../style/models/style';
import { CardFaceComponent } from '../card-face/card-face.component';
import { parseCssDimension, parseCssDimensionToNumber } from '../../../style/utils/parse-css-dimensions.utils';
import { CardFaceApiService } from '../../services/card-game-core/card-face-api.service';
import { CardFace } from '../../models/card-face';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { convertToRelativeCoordinates, convertToRelativeDimensions } from '../../../drag-and-drop/utils/coordinate-conversions.utils';
import { DndPosition } from '../../../drag-and-drop/models/dnd-types';

@Component({
  selector: 'app-card',
  imports: [
    DndContentDirective, CardFaceComponent,
    CommonModule
  ],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css',
  // animations: [cardFlipAnimation]
})
export class CardComponent {
  private cardFaceApiService: CardFaceApiService = inject(CardFaceApiService);
  
  // https://medium.com/@chandrashekharsingh25/angular-signals-explained-with-practical-examples-e45de6d00925
  // Might need computed signals then

  card: InputSignal<Card> = input<Card >({
    cardId: 0,
    currentCardFaceIndex: 0,
    cardName: ''
  });

  cardFaces: CardFace[] = [

  ];

  currentCardFace: CardFace = {
    cardFaceId: 0,
    style: {
      styleId: 0
    }
  }

  cardChange = output<Card>();

  // TODO: Probably refactor this, how do we get this information up there?
  actionContextMenuItems: ActionContextMenuItem[] = [
    {
      id: 0,
      name: "Flip",
      action: this.flip
    }
  ];

  actionContextMenuItemsChange = output<ActionContextMenuItem[]>();

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

  zoomLevel: InputSignal<number> =  input<number>(1);
  scaleLevel: number = 1;

  transform() {
    return `scale(${this.scaleLevel})`;
  }
  
  constructor() {
    effect(() => {
      let card: Card | undefined = this.card();
      
      // https://builtin.com/software-engineering-perspectives/forkjoin
      if (card !== undefined) {
        this.loadCardFaces(card);
      }

      let zoomLevel: number | undefined = this.zoomLevel();

      if (zoomLevel !== undefined && zoomLevel !== 0) {
        this.scaleLevel = zoomLevel;
      }
    });
  }

  // TODO: Rework this, use cardApiService to get the card face IDs, then use a switch map, pass it into the next then assign the cardFaces
  private loadCardFaces(card: Card): void {
    this.cardFaceApiService.getCardFacesPerCard$(card.cardId).subscribe((result: CardFace[] | undefined) => {
      if (result != undefined) {
        this.cardFaces = result;
        this.currentCardFace = this.cardFaces[0];
      }
    });

    /*forkJoin({
      front: this.cardFaceApiService.getCardFace$(card.frontCardFaceId as number),
      back: this.cardFaceApiService.getCardFace$(card.backCardFaceId as number)
    }).subscribe(({ front, back }) => {
      if (front && back) {
        this.currentCardFace = front;
        this.backCardFace = back;

        console.log(`Front card face: ${JSON.stringify(this.currentCardFace)}`);
        console.log(`Back card face: ${JSON.stringify(this.backCardFace)}`);
      }
    });*/
  }

  // TODO: Replace this
  flip(): void {
    this.card().currentCardFaceIndex = (this.card().currentCardFaceIndex == 0) ? 1 : 0;
    this.cardChange.emit(this.card());
  }
}
