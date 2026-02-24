import { Component, computed, effect, inject, input, InputSignal, model, ModelSignal, Signal } from '@angular/core';

import { Card } from '../../models/card';


import { Dimensions, getLodIndex, logInfo } from '../../../../../utils/utils';
import { CardService } from '../../services/facade/card.service';
import { getDefaultCardEditorCardFaceDimensions } from '../../../card-editor/constants/card-editor.constants';
import { DEFAULT_CARD_FACE_PLACEHOLDER_SRC } from '../../../card-face/constants/card-face.constants';
import { CardFaceImage } from '../../../card-face/utils/card-face.utils';
import { CardFaceComponent } from '../../../card-face/components/core/card-face.component';

@Component({
  selector: 'app-card',
  imports: [
    CardFaceComponent
],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  // animations: [cardFlipAnimation]
})
export class CardComponent {
  private readonly cardService: CardService = inject<CardService>(CardService);

  public $card: ModelSignal<Card> = model<Card>({
    cardId: "0",
    currentCardFaceId: '',
    cardName: ''
  });

  // TODO: Figure out the alternate text for images
  // TODO:
  // 1. Potentially store the file metadata ID OR file name associated with the card face image
  // The reason is so we can check to see if it's already there, so we don't have to load that LOD again.
  private cardFaceIdImagesPairs: Map<string, CardFaceImage[]> = new Map<string, CardFaceImage[]>();

  public readonly $cardScale: InputSignal<number> = input<number>(1);

  private readonly $currentLodComputed: Signal<number> = computed<number>(() => getLodIndex(this.$cardScale()));

  constructor() {
    effect(() => {
      // https://builtin.com/software-engineering-perspectives/forkjoin
      // CHECKME: Are there unnecessary reloadings in place causing lag and dimensions calculation errors?
      // It's not reading the card periodically, is triggered by certain actions
      // TODO: We need to figure out how to ONLY load the card faces when the card faces themselves have changed AND when the card model changes

      // Potentially also if $cardScale changes too
      if (this.$card()) {
        this.cardService.loadCardFaces(this.$card(), this.cardFaceIdImagesPairs, this.defaultCardFaceDimensions);

        // this.setDefaultDimensionsFromFrontFace();
      }
    });
  }

  // TODO: Grab the dimensions of the first card face, always, check and see if there's a dimension associated with it
  // CHECKME: Move into service?
  private defaultCardFaceDimensions: Dimensions = getDefaultCardEditorCardFaceDimensions();

  protected getCurrentCardFaceImage(): CardFaceImage {
    return this.cardService.getCurrentCardFaceImage(this.$card().currentCardFaceId, this.cardFaceIdImagesPairs, this.$currentLodComputed(), this.defaultCardFaceDimensions);
  }

  private onRevokeSrc(url: string): void {
    console.log(`%c${logInfo(this.constructor.name, this.onRevokeSrc.name)}: Url to revoke: ${url}`, `color: #627566; background: #D0E9F0; padding: 5px; border-radius: 5px;`);

    if (!url.startsWith('blob:')) {
      console.error(`${logInfo(this.constructor.name, this.onRevokeSrc.name)}: Should be a blob we're revoking`);
      return;
    }

    URL.revokeObjectURL(url);
    // console.log('Blob URL revoked after image loaded');
  }

  public ngOnDestroy(): void {
    // Image not loading on flipped card, problem is it's being destroyed as the card's being flipped, so it's not present in the DOM to be taken images of
    // TODO: Actually call the revoke source somehow
    // This is literally just a workaround and not gonna work
    this.cardFaceIdImagesPairs.forEach((values: CardFaceImage[], key: string) => {
      if (!values)
        throw new Error("Card face image doesn't have a url");

      values.forEach((value: CardFaceImage) => {
        if (value.src !== '' && value.src !== DEFAULT_CARD_FACE_PLACEHOLDER_SRC) this.onRevokeSrc(value.src);
      });
    })
  }
}