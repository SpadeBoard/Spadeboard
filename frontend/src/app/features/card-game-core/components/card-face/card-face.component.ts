import { Component, computed, effect, inject, input, InputSignal, Signal } from '@angular/core';

import { CardFace } from '../../models/card-face';

import { CardFaceElement } from '../../models/card-face-element';
import { convertToRelativeCoordinates } from '../../../drag-and-drop/utils/coordinate-conversions.utils';
import { CardFaceElementApiService } from '../../services/card-face-element-api.service';
import { CardFaceElementComponent } from '../card-face-element/card-face-element.component';

@Component({
  selector: 'app-card-face',
  imports: [CardFaceElementComponent],
  templateUrl: './card-face.component.html',
  styleUrl: './card-face.component.css'
})
export class CardFaceComponent {
  // TODO: Have the calculation to convert the card face elements here
  cardFaceInput: InputSignal<CardFace | undefined>=  input<CardFace | undefined>({
    cardFaceId: 0,
    style: {
      styleId: 0,
      width: '0px',
      height: '0px'
    }
  });
  readonly cardFaceComputed: Signal<CardFace | undefined> = computed(() => this.cardFaceInput());

  cardFace: CardFace = {
    cardFaceId: 0,
    style: {
      styleId: 0
    }
  }

  /*readonly cardFaceId: InputSignal<number | undefined> = input<number>();
  readonly cardFaceIdComputed: Signal<number | undefined> = computed(() => this.cardFaceId() ?? -1);*/

  private cardFaceElementApiService: CardFaceElementApiService = inject(CardFaceElementApiService);

  cardFaceElementsInput: InputSignal<CardFaceElement[] | undefined> = input<CardFaceElement[] | undefined>([
    
  ]);
  readonly cardFaceElementsComputed: Signal<CardFaceElement[] | undefined> = computed(() => this.cardFaceElementsInput());
  cardFaceElements: CardFaceElement[] = [];

  constructor() {
    effect(() => {
      let cardFace = this.cardFaceComputed();
      
      if (cardFace !== undefined && cardFace.cardFaceId !== 0) {
        this.cardFace = cardFace;
      }

      if (this.cardFace !== undefined && this.cardFace.cardFaceId !== 0) {
        // 404 error, something's wrong with the frontend, why are we passing in 0, 0, then 1, 2
        this.cardFaceElementApiService.getCardFaceElements(this.cardFace.cardFaceId).subscribe(cardFaceElements => {
          if (cardFaceElements !== undefined)
            this.cardFaceElements = cardFaceElements;
        });
      }

      /*let cardFaceElements = this.cardFaceElementsComputed();

      if (cardFaceElements !== undefined) {
        this.cardFaceElements = cardFaceElements;
      }*/
    });
  }

  ngOnInit() {
    // TODO: Grab all the card face elements
  }

  convertCardFaceElementsPosition(cardFaceElements: CardFaceElement[]): void {
    cardFaceElements.forEach(element => {
      // convertToRelativeCoordinates();
    });
  }
}
