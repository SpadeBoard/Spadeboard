import { Component, computed, input, InputSignal, Signal } from '@angular/core';


import { CommonModule } from '@angular/common';
import { DEFAULT_CARD_FACE_DIMENSIONS, DEFAULT_CARD_FACE_PLACEHOLDER_ALT, DEFAULT_CARD_FACE_PLACEHOLDER_SRC, getDefaultCardFaceImage } from '../../utils/card-face.constants';
import { CardFaceImage } from '../../utils/card-face.utils';
import { Dimensions } from 'ngx-image-cropper';
import { getScaledItemRenderDimensions } from '../../../../utils/utils';

// https://medium.com/@niteshdaga000/optimizing-performance-with-memory-caching-in-angular-applications-dad3efeb1f99
// TODO: When loading in the cards menu, use a hybdrid approach of storing the indices, caching the images in memory, using LRU, and only replacing the images that have changed via checking timestamp
@Component({
  selector: 'app-card-face',
  imports: [CommonModule],
  templateUrl: './card-face.component.html',
  styleUrl: './card-face.component.scss'
})
export class CardFaceComponent {
  public readonly $cardFaceScale: InputSignal<number> = input<number>(1);

  public readonly $cardFaceImage: InputSignal<CardFaceImage> = input<CardFaceImage>(getDefaultCardFaceImage(DEFAULT_CARD_FACE_PLACEHOLDER_SRC, DEFAULT_CARD_FACE_PLACEHOLDER_ALT, DEFAULT_CARD_FACE_DIMENSIONS));

  protected readonly $cardFaceImageSrcComputed: Signal<string> = computed(() => this.$cardFaceImage().src);
  protected readonly $cardFaceImageAltComputed: Signal<string> = computed(() => this.$cardFaceImage().alt);

  protected readonly $cardFaceImageDimensionsComputed: Signal<Dimensions> = computed(() => {
    let { dimensions } = this.$cardFaceImage();

    return getScaledItemRenderDimensions(dimensions, this.$cardFaceScale())
  });
}
