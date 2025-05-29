import { Component, Signal, viewChildren, output, input, inject, effect, computed, SimpleChanges, InputSignal, Input, HostListener, ViewChild, ElementRef, AfterViewInit, afterRenderEffect, ModelSignal, model } from '@angular/core';

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
import { CardEditorPreviewService } from '../../services/card-editor-preview.service';
import { CardGameCoreService } from '../../services/card-game-core/card-game-core.service';
import { ActionContextMenuComponent } from '../../../actions-context-menu/components/action-context-menu/action-context-menu/action-context-menu.component';

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
  private readonly cardFaceApiService: CardFaceApiService = inject(CardFaceApiService);
  // https://medium.com/@chandrashekharsingh25/angular-signals-explained-with-practical-examples-e45de6d00925
  // Might need computed signals then

  @ViewChild('cardFace') cardFaceRef!: CardFaceComponent;

  card: ModelSignal<Card> =model<Card >({
    cardId: "0",
    currentCardFaceIndex: 0,
    cardName: '',
    isTemplate: false
  });

  cardFaces: CardFace[] = [

  ];

  currentCardFace: CardFace = {
    cardFaceId: "0",
    style: {
      styleId: "0"
    }
  }

  cardScale: InputSignal<number> =  input<number>(1);
  cardScaleComputed: Signal<number>  = computed(() => this.cardScale());

  constructor() {
    effect(() => {
      let card: Card | undefined = this.card();
      
      // https://builtin.com/software-engineering-perspectives/forkjoin
      if (card !== undefined) {
        this.loadCardFaces(card);
      }
    });
  }

  setCardFaceImageDimensionsOnDndBoard(): void {
    if (this.cardFaceRef && this.cardScale() && this.cardScale() !== 0) {
      this.cardFaceRef.setCardFaceImageDimensions(this.cardScale());
    }
  }

  // TODO: Rework this, use cardApiService to get the card face IDs, then use a switch map, pass it into the next then assign the cardFaces
  private loadCardFaces(card: Card): void {
    this.cardFaceApiService.getCardFacesPerCard$(card.cardId).subscribe((result: CardFace[] | undefined) => {
      if (result != undefined) {
        this.cardFaces = result;
        this.currentCardFace = this.cardFaces[card.currentCardFaceIndex];
      }
    });
  }
}
