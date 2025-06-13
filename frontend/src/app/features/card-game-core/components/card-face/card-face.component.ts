import { Component, computed, effect, input, InputSignal, Signal } from '@angular/core';


import { CommonModule } from '@angular/common';
import { Dimensions, getScaledItemRenderDimensions } from '../../../../utils/utils';

// https://medium.com/@niteshdaga000/optimizing-performance-with-memory-caching-in-angular-applications-dad3efeb1f99
// TODO: When loading in the cards menu, use a hybdrid approach of storing the indices, caching the images in memory, using LRU, and only replacing the images that have changed via checking timestamp
@Component({
  selector: 'app-card-face',
  imports: [CommonModule],
  templateUrl: './card-face.component.html',
  styleUrl: './card-face.component.css'
})
export class CardFaceComponent {
  cardFaceImageSrc: InputSignal<string> = input<string>("");
  cardFaceImageSrcComputed: Signal<string> = computed(() => this.cardFaceImageSrc() !== "" ? this.cardFaceImageSrc() : '/blank-card-canvas.svg');

  cardFaceScale: InputSignal<number> = input<number>(1);

  // https://stackoverflow.com/a/27197907

  DEFAULT_BASE_WIDTH: number = 154;
  DEFAULT_BASE_HEIGHT: number = 215;

  baseDimensions: Dimensions = {
    width: this.DEFAULT_BASE_WIDTH,
    height: this.DEFAULT_BASE_HEIGHT
  }

  image= {
    src: '/blank-card-canvas.svg',
    alt: 'Placeholder card face',
    width: this.baseDimensions.width,
    height: this.baseDimensions.height
  };

  // TODO: Refactor this, this should not be here?
  // To be used on DND Board, but should just be general in case?
  // Here's the problem, if you just use transform scale here, the interactive area's not going to resize, which is going to cause issues with UX
  setCardFaceImageDimensions(scale: number) {
    let scaledDimensions: Dimensions = getScaledItemRenderDimensions(this.baseDimensions, scale); // NOTE: Should this even be in this service? It's just a general scaling function

    // FIXED: It was taking the new width and height then multiplying by that instead. Compounded scaling.
    this.image.width = scaledDimensions.width;
    this.image.height = scaledDimensions.height;
  }

  constructor() {
    effect(() => {
      if (this.shouldScaleCardFace()) {
        this.setCardFaceImageDimensions(this.cardFaceScale());
      }
    });
  }

  shouldScaleCardFace(): boolean {
    let scale: number = this.cardFaceScale();
    return scale !== undefined && scale !== null && scale !== 0 && scale !== 1;
  }

  setBaseDimensions(baseDimensionWidth: number, baseDimensionHeight: number) {
    this.baseDimensions.width = baseDimensionWidth;
    this.baseDimensions.height = baseDimensionHeight;
    
    if (this.shouldScaleCardFace()) {
      this.setCardFaceImageDimensions(this.cardFaceScale());
      return;
    }

     this.image.width = this.baseDimensions.width;
     this.image.height = this.baseDimensions.height;
  }

  setPlaceholderCardFace() {
    this.image.src = "/blank-card-canvas.svg";
    this.image.alt = 'Placeholder card face';

    this.setBaseDimensions(this.DEFAULT_BASE_WIDTH, this.DEFAULT_BASE_HEIGHT);
  }
}
