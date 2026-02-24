import { Component, computed, input, InputSignal, Signal } from '@angular/core';



import { DEFAULT_CARD_FACE_DIMENSIONS, DEFAULT_CARD_FACE_PLACEHOLDER_ALT, DEFAULT_CARD_FACE_PLACEHOLDER_SRC, getDefaultCardFaceImage } from '../../constants/card-face.constants';
import { CardFaceImage } from '../../utils/card-face.utils';
import { Dimensions } from '../../../../../utils/utils';
import { getScaledItemRenderDimensions } from '../../../../../utils/utils';

// https://medium.com/@niteshdaga000/optimizing-performance-with-memory-caching-in-angular-applications-dad3efeb1f99
// TODO: When loading in the cards menu, use a hybdrid approach of storing the indices, caching the images in memory, using LRU, and only replacing the images that have changed via checking timestamp
@Component({
  selector: 'app-card-face',
  imports: [],
  templateUrl: './card-face.component.html',
  styleUrl: './card-face.component.scss'
})
export class CardFaceComponent {
  public readonly $cardFaceScale: InputSignal<number> = input<number>(1);

  public readonly $cardFaceImage: InputSignal<CardFaceImage> = input<CardFaceImage>(getDefaultCardFaceImage(DEFAULT_CARD_FACE_PLACEHOLDER_SRC, DEFAULT_CARD_FACE_PLACEHOLDER_ALT, DEFAULT_CARD_FACE_DIMENSIONS));

  protected readonly $cardFaceImageDimensions: Signal<Dimensions> = computed<Dimensions>(() => {
    let { dimensions } = this.$cardFaceImage();

    return getScaledItemRenderDimensions(dimensions, this.$cardFaceScale())
  });
}
