import { Component, Signal, viewChildren, output, input, inject, effect, computed, SimpleChanges } from '@angular/core';

import { Card } from '../../models/card';
import { cardFlipAnimation } from './card.animations';

import { DndBoardService } from '../../services/dnd-board.service';
import { DndContentDirective } from '../../../drag-and-drop/directives/dnd-content.directive';
import { ActionContextMenuItem } from '../../../actions-context-menu/models/action-context-menu-item';

import { Style } from '../../../style/models/style';
import { CardFaceComponent } from '../card-face/card-face.component';
import { parseCssDimension, parseCssDimensionToNumber } from '../../../style/utils/parse-css-dimensions.utils';
import { CardFaceApiService } from '../../services/card-face-api.service';
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
  private dndBoardService: DndBoardService = inject(DndBoardService);
  
  // TODO: If parent dimensions is larger than 0, then calculate the width and height
  parentDimensionsInput = input<{width: number, height: number} | undefined>();

  // https://medium.com/@chandrashekharsingh25/angular-signals-explained-with-practical-examples-e45de6d00925
  // Might need computed signals then

  parentDimensions: {width: number, height: number} = {
    width: 0,
    height: 0
  };

  card = input<Card >({
    cardId: 0,
    frontCardFaceId: 0,
    backCardFaceId: 0,
    ownerId: '5811e387-1551-4090-9485-a3ebe30efb5a',
    isFlipped: false,
    dndItem: {
      dndItemId: 0,
      isDraggable: false,
      isDroppable: false,
    },
    dndPosition: { x: 0, y: 0 },
    style: {
      styleId: 0,
      height: '', // CHECKME: Aspect ratio set then what
      width: '', // CHECKME: Aspect ratio set then what
      margin: '50'
    }
  });

  cardStyle: Omit<Style, 'styleId'> = {
    border: '2px dotted rgb(204, 204, 204)'
  }

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
  
  // TODO: Temporary
  isFlipped: boolean = true;

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
  
  constructor() {
    effect(() => {
      let card: Card | undefined = this.card();
      
      // https://builtin.com/software-engineering-perspectives/forkjoin
      if (card !== undefined) {
        this.loadCardFaces(card);
      }
    });
  }

  private loadCardFaces(card: Card): void {
    forkJoin({
      front: this.cardFaceApiService.getCardFace(card.frontCardFaceId),
      back: this.cardFaceApiService.getCardFace(card.backCardFaceId)
    }).subscribe(({ front, back }) => {
      if (front && back) {
        this.frontCardFace = front;
        this.backCardFace = back;

        console.log(`Front card face: ${JSON.stringify(this.frontCardFace)}`);
        console.log(`Back card face: ${JSON.stringify(this.backCardFace)}`);
      }
    });
  }

  // Don't use style service, dynamically create the styling here
  cardFaces: Signal<readonly CardFaceComponent[]> = viewChildren(CardFaceComponent);

  flip(): boolean {
    this.card().isFlipped = !this.card().isFlipped;
    this.cardChange.emit(this.card());

    return this.card().isFlipped;
  }
}
