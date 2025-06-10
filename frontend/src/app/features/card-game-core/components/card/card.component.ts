import { Component, computed, effect, inject, input, InputSignal, model, ModelSignal, Signal, ViewChild } from '@angular/core';

import { Card } from '../../models/card';

import { CommonModule } from '@angular/common';
import { CardFace } from '../../models/card-face';
import { CardFaceApiService } from '../../services/card-game-core/api/card-face-api.service';
import { CardFaceComponent } from '../card-face/card-face.component';

@Component({
  selector: 'app-card',
  imports: [
    CardFaceComponent,
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
