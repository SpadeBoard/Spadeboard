import { Component, Signal, viewChildren, output, input, inject, effect, computed, SimpleChanges } from '@angular/core';

import { Card } from '../../models/card';
import { cardFlipAnimation } from './card.animations';

import { DndCardBoardService } from '../../services/dnd-card-board.service';
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
  private dndCardBoardService: DndCardBoardService = inject(DndCardBoardService);
  
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

  /*cardComputed = computed(() => {
    let card: Card | undefined = this.card();

    if (card !== undefined) 
    {
      this.cardFaceApiService.getCardFace(card.frontCardFaceId).subscribe(cardFace => {
        if (cardFace !== undefined) {
          this.frontCardFace = cardFace;
        }
      });

      this.cardFaceApiService.getCardFace(card.backCardFaceId).subscribe(cardFace => {
        if (cardFace !== undefined) {
          this.backCardFace = cardFace;
        }
      });
    }
  });*/

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

      // FIXME: Why is it not updating
      let parentDimensionsInput: {
        width: number;
        height: number;
      } | undefined = this.parentDimensionsInput();
      
      // https://builtin.com/software-engineering-perspectives/forkjoin
      if (card !== undefined && parentDimensionsInput !== undefined) {
        forkJoin({
          front: this.cardFaceApiService.getCardFace(card.frontCardFaceId),
          back: this.cardFaceApiService.getCardFace(card.backCardFaceId)
        }).subscribe(({ front, back }) => {
          if (front !== undefined && back !== undefined) {
            this.frontCardFace = front;
            this.backCardFace = back;
  
            console.log(`Front card face: ${JSON.stringify(this.frontCardFace)}`);
            console.log(`Back card face: ${JSON.stringify(this.backCardFace)}`);
          }

          this.parentDimensions = parentDimensionsInput;
    
          // FIXME: Now why doesn't it set the style
          this.setCardStyle();
        });
      }
    });
  }

  ngOnInit() {
    // this.setCardStyle();
    // this.getCardStyle();
  }

  // CHECKME
  // Why wouldn't effect work though?
  /*ngOnChanges(changes: SimpleChanges): void {
    if (changes['card'] && this.card) {
      this.loadCardFaces(this.card());
    }

    if (changes['parentDimensionsInput'] && this.parentDimensionsInput()) {
      let parentDimensionsInput: {
        width: number;
        height: number;
      } | undefined = this.parentDimensionsInput();

      if (parentDimensionsInput !== undefined)
        this.parentDimensions = parentDimensionsInput;

      console.log('parentDimensions updated:', this.parentDimensions);
      // Optionally, call setCardStyle() here if it depends on parentDimensions
      this.setCardStyle();
    }
  }*/

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

        // Call setCardStyle after both card faces are set
        this.setCardStyle();
      }
    });
  }

  // Don't use style service, dynamically create the styling here
  cardFaces: Signal<readonly CardFaceComponent[]> = viewChildren(CardFaceComponent);

  getCardStyle(): Omit<Style, 'styleId'> {
    let style: Style = {
      styleId: 0,
    };
  
    // Check if `this.card()` and `this.card().style` are defined
    if (!this.card() || !this.card().dndItem || !this.card().style) {
      return style;
    }
  
    // Safely access properties of `this.card().style`
    /*style = {
      styleId: this.card().style.styleId ?? 0, // Use nullish coalescing to provide a default value
      height: this.card().style.height ?? 0,
      width: this.card().style.width ?? 0,
      margin: this.card().style.margin ?? 0,
    };*/
  
    return style;
  }

  // CHECKME: Careful, if child's set to percentage, this might actually screw it up
  setCardStyle(): void {
    /*let cardFaces = this.cardFaces();

    if (!cardFaces)
      return;*/

    let cardDimensions: {x: string, y: string} = {x: '0px', y: '0px'};

    let frontFaceDim: {x: string | undefined, y: string | undefined} = {x: this.frontCardFace.style.width, y: this.frontCardFace.style.height};
    let backFaceDim: {x: string | undefined, y: string | undefined} = {x: this.backCardFace.style.width, y: this.backCardFace.style.height};

    // FIXME: This is null,which is a problem, but why is it null
    cardDimensions = {
      x: parseCssDimension(frontFaceDim.x) > parseCssDimension(backFaceDim.x) ? frontFaceDim.x! : backFaceDim.x!,
      y: parseCssDimension(frontFaceDim.y) > parseCssDimension(backFaceDim.y) ? frontFaceDim.y! : backFaceDim.y!
    };

    let cardDimensionsNumeric = {
      x: parseCssDimensionToNumber(cardDimensions.x),
      y: parseCssDimensionToNumber(cardDimensions.y)
    };

    let parentDimensions= this.parentDimensions;

    console.log(`Parent dimensions: ${JSON.stringify(parentDimensions)}`);

    // FIXME: Convert to relative coordinates
    if (parentDimensions=== undefined)
      return;

    // TODO: Temporary scale factor
    let convertedDimensions = convertToRelativeDimensions({width: cardDimensionsNumeric.x, height: cardDimensionsNumeric.y}, parentDimensions, 1/2);
    
    // FIXME: Way too big?
    this.cardStyle.width =  `${convertedDimensions.x}px`; // `${convertedDimensions.x}%`;
    this.cardStyle.height = `${convertedDimensions.y}px`; // `${convertedDimensions.y}%`;

    console.log(`Card style: ${JSON.stringify(this.cardStyle)}`);

    /*let card = this.card();
    if (
      !card
      || !card.dndItem
      || !card.dndItem.style
      || !card.dndItem.style.width
      || !card.dndItem.style.height
    ) {
      return;
    }

    // Now TypeScript knows that all these properties exist
    card.dndItem.style.width = cardDimensions.x;
    card.dndItem.style.height = cardDimensions.y;

    this.cardStyle = card.dndItem.style;

    console.log(`Card style: ${this.cardStyle}`);*/
  }

  flip(): boolean {
    this.card().isFlipped = !this.card().isFlipped;
    this.cardChange.emit(this.card());

    return this.card().isFlipped;
  }
}
