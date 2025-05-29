import { Component, Signal, viewChildren, output, input, inject, effect, computed, SimpleChanges, InputSignal, Input, HostListener, ViewChild, ElementRef, AfterViewInit, afterRenderEffect, ModelSignal, model } from '@angular/core';

import { Card } from '../../models/card';
import { cardFlipAnimation } from './card.animations';

import { DndContentDirective } from '../../../drag-and-drop/directives/dnd-content.directive';

import { CardFaceComponent } from '../card-face/card-face.component';
import { CardFaceApiService } from '../../services/card-game-core/card-face-api.service';
import { CardFace } from '../../models/card-face';
import { CommonModule } from '@angular/common';

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
