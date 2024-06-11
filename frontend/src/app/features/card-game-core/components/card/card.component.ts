import { Component, Signal, viewChildren, output, input, inject, effect, computed } from '@angular/core';

import { Card } from '../../models/card';
import { cardFlipAnimation } from './card.animations';

import { DndCardBoardService } from '../../services/dnd-card-board.service';
import { DndContentDirective } from '../../../drag-and-drop/directives/dnd-content.directive';
import { ActionContextMenuItem } from '../../../actions-context-menu/models/action-context-menu-item';

import { Style } from '../../../style/models/style';
import { CardFaceComponent } from '../card-face/card-face.component';
import { parseCssDimension } from '../../../style/utils/parse-css-dimensions.utils';
import { CardFaceApiService } from '../../services/card-face-api.service';
import { CardFace } from '../../models/card-face';

@Component({
  selector: 'app-card',
  imports: [
    DndContentDirective, CardFaceComponent
  ],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css',
  // animations: [cardFlipAnimation]
})
export class CardComponent {
  private cardFaceApiService: CardFaceApiService = inject(CardFaceApiService);
  private dndCardBoardService: DndCardBoardService = inject(DndCardBoardService);
  
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
      dndPosition: { x: 0, y: 0 },
      style: {
        styleId: 0,
        height: '', // CHECKME: Aspect ratio set then what
        width: '', // CHECKME: Aspect ratio set then what
        margin: '50'
      }
    }
  });

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

      if (card !== undefined) {
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
    })
  }

  ngOnInit() {
    // this.setCardStyle();
    // this.getCardStyle();
  }

  // Don't use style service, dynamically create the styling here
  cardFaces: Signal<readonly CardFaceComponent[]> = viewChildren(CardFaceComponent);

  getCardStyle(): Omit<Style, 'styleId'> {
    let style: Style = {
      styleId: 0,
    };
  
    // Check if `this.card()` and `this.card().style` are defined
    if (!this.card() || !this.card().style) {
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
    let cardFaces = this.cardFaces();

    if (!cardFaces)
      return;

    let cardDimensions: {x: string, y: string} = {x: '0px', y: '0px'};

    let frontFaceDim: {x: string | undefined, y: string | undefined} = {x: cardFaces[0].cardFace.style.width, y: cardFaces[0].cardFace.style.height};
    let backFaceDim: {x: string | undefined, y: string | undefined} = {x: cardFaces[0].cardFace.style.width, y: cardFaces[0].cardFace.style.height};

    cardDimensions = {
      x: parseCssDimension(frontFaceDim.x) > parseCssDimension(backFaceDim.x) ? frontFaceDim.x! : backFaceDim.x!,
      y: parseCssDimension(frontFaceDim.y) > parseCssDimension(backFaceDim.y) ? frontFaceDim.y! : backFaceDim.y!
    };

    let card = this.card();
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
  }

  flip(): boolean {
    this.card().isFlipped = !this.card().isFlipped;
    this.cardChange.emit(this.card());

    return this.card().isFlipped;
  }
}
