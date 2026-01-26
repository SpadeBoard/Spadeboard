import { Component, computed, inject, input, InputSignal, Signal } from '@angular/core';
import { Dimensions } from '../../../../utils/utils';
import { CardFaceElementImageService } from '../../services/card-game-core/card-face-element/images/card-face-element-image.service';
import { DEFAULT_CARD_FACE_PLACEHOLDER_ALT } from '../../utils/card-face.constants';

@Component({
  selector: 'app-card-face-image',
  imports: [],
  templateUrl: './card-face-image.component.html',
  styleUrl: './card-face-image.component.scss'
})
export class CardFaceImageComponent {
  private readonly cardFaceElementImageService: CardFaceElementImageService = inject(CardFaceElementImageService);

  public readonly $cardFaceImageSrc: InputSignal<string> = input<string>(this.cardFaceElementImageService.PLACEHOLDER_IMAGE_SRC);

  public readonly $cardFaceImageAlt: InputSignal<string> = input<string>(DEFAULT_CARD_FACE_PLACEHOLDER_ALT);

  public readonly $cardFaceImageWidth: InputSignal<number> = input<number>(100);
  public readonly $cardFaceImageHeight: InputSignal<number> = input<number>(100);

  // FIXME: Why this ain't working
  protected readonly $cardFaceImageDimensions: Signal<Dimensions> = computed(() => {
      return {
        width: this.$cardFaceImageWidth(),
        height: this.$cardFaceImageHeight()
      };
  });

  constructor() {}

  public ngOnDestroy(): void {
    // FIXME: Image not loading on flipped card, problem is it's being destroyed as the card's being flipped, so it's not present in the DOM to be taken images of
    // TODO: Actually call the revoke source somehow
    // This is literally just a workaround and not gonna work for all systems depending on how slow they are
    setTimeout(() => {
      this.cardFaceElementImageService.onRevokeSrc(this.$cardFaceImageSrc());
    }, 10000);
  }
}
