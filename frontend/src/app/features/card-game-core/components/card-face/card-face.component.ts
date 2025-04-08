import { Component, computed, effect, inject, input, InputSignal, Signal } from '@angular/core';

import { CardFace } from '../../models/card-face';

import { CardFaceElement, CardFaceElementDto } from '../../models/card-face-element';
import { convertToRelativeCoordinates } from '../../../drag-and-drop/utils/coordinate-conversions.utils';
import { CardFaceElementApiService } from '../../services/card-face-element-api.service';
import { CardFaceElementComponent } from '../card-face-element/card-face-element.component';
import { parseCssDimensionToNumber } from '../../../style/utils/parse-css-dimensions.utils';
import { DndPosition } from '../../../drag-and-drop/models/dnd-types';
import { isCardFaceElementDto } from '../../utils/card-game-core.utils';

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

  cardFaceElementsDtoInput: InputSignal<CardFaceElementDto[] | undefined> = input<CardFaceElementDto[] | undefined>([
    
  ]);
  readonly cardFaceElementsComputed: Signal<CardFaceElementDto[] | undefined> = computed(() => this.cardFaceElementsDtoInput());
  cardFaceElementsDto: CardFaceElementDto[] = [];

  constructor() {
    effect(() => {
      let cardFace = this.cardFaceComputed();
      
      if (cardFace !== undefined && cardFace.cardFaceId !== 0) {
        this.cardFace = cardFace;
      }

      if (this.cardFace !== undefined && this.cardFace.cardFaceId !== 0) {
        // 404 error, something's wrong with the frontend, why are we passing in 0, 0, then 1, 2
        this.cardFaceElementApiService.getCardFaceElements(this.cardFace.cardFaceId).subscribe(cardFaceElements => {
          if (cardFaceElements !== undefined) {
            this.cardFaceElementsDto = this.convertCardFaceElementsDtoPosition(cardFaceElements as CardFaceElementDto[]);
            
            // FIXME: Can't place width and height, because there's no position being stored
            this.cardFaceElementsDto.forEach(element => {
              // console.log(`Mapped element: ${JSON.stringify(element.dndItem?.dndPosition)}`);
            })
          }
        });
      }

      /*let cardFaceElements = this.cardFaceElementsDtoComputed();

      if (cardFaceElements !== undefined) {
        this.cardFaceElementsDto = cardFaceElements;
      }*/
    });
  }

  ngOnInit() {
    // TODO: Grab all the card face elements
  }

  convertCardFaceElementsDtoPosition(cardFaceElementsDto: CardFaceElementDto[]): CardFaceElementDto[] {
    let newCardFaceElementDtos: CardFaceElementDto[] = [];
      
    newCardFaceElementDtos = cardFaceElementsDto.map(element => {
      // Create a shallow copy of the element to avoid modifying the original
      let newElementDto: CardFaceElementDto = { ...element };

      // TODO: Put in separate function
      if (newElementDto.dndItemDto.dndItem && this.cardFace.style?.width && this.cardFace.style?.height) {
        let cardFaceDimensionsNumeric = {
          width: parseCssDimensionToNumber(this.cardFace.style.width),
          height: parseCssDimensionToNumber(this.cardFace.style.height)
        };

        let relativeCoordinate: DndPosition = convertToRelativeCoordinates(
          newElementDto.dndItemDto.dndPosition,
          cardFaceDimensionsNumeric
        );

        // Create a new dndItem object to avoid mutation
        newElementDto.dndItemDto = {
          dndItem: newElementDto.dndItemDto.dndItem,
          dndPosition: relativeCoordinate
        };

      }

      return newElementDto;
    });

    return newCardFaceElementDtos;
  }
}
