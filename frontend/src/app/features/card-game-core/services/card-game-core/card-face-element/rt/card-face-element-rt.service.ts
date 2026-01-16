import { Injectable } from '@angular/core';
import { CardFaceElementPerCardFace, CardFaceElementRt } from '../../../../models/card-face-element';
import { getCardFaceElementRt } from '../../../../utils/card-game-core.utils';
import { CardFaceElementService } from '../card-face-element.service';

@Injectable({
  providedIn: 'root'
})
export class CardFaceElementRtService {
  constructor() { }

  public getElement(cardFaceElementId: string, cardFaceElementsPerCardFace: CardFaceElementPerCardFace[], cardFaceElementService: CardFaceElementService): CardFaceElementRt {
    let cardFaceElementPerCardFace: CardFaceElementPerCardFace | undefined = cardFaceElementService.getCardFaceElementPerCardFace(cardFaceElementId, cardFaceElementsPerCardFace, 'Rt');

    if (!cardFaceElementPerCardFace) throw new Error("Card face element RT: There is no current card face element per card face to set attributes");

    let cardFaceElementRt: CardFaceElementRt | undefined = getCardFaceElementRt(cardFaceElementPerCardFace.cardFaceElement);

    if (!cardFaceElementRt) throw new Error("No card face element rich text");

    return cardFaceElementRt;
  }

  public getRt(cardFaceElementId: string, cardFaceElementsPerCardFace: CardFaceElementPerCardFace[], cardFaceElementService: CardFaceElementService): string {
   return this.getElement(cardFaceElementId, cardFaceElementsPerCardFace, cardFaceElementService).cardFaceElementContent;
  }

  public setRt(cardFaceElementId: string, text: string, cardFaceElementsPerCardFace: CardFaceElementPerCardFace[], cardFaceElementService: CardFaceElementService): void {
    let cardFaceElementRt: CardFaceElementRt | undefined = this.getElement(cardFaceElementId, cardFaceElementsPerCardFace, cardFaceElementService);

    if (cardFaceElementRt === undefined) throw new Error("Card face element rich text is undefined or not an RTE");

    cardFaceElementRt.cardFaceElementContent = text;
  }

  public isRt(cardFaceElementId: string, cardFaceElementsPerCardFace: CardFaceElementPerCardFace[], cardFaceElementService: CardFaceElementService): boolean {
    let cardFaceElementPerCardFace: CardFaceElementPerCardFace | undefined = cardFaceElementService.getCardFaceElementPerCardFace(cardFaceElementId, cardFaceElementsPerCardFace, 'Rt');

    if (!cardFaceElementPerCardFace) return false;

    let cardFaceElementRt: CardFaceElementRt | undefined = getCardFaceElementRt(cardFaceElementPerCardFace.cardFaceElement);

    if (!cardFaceElementRt) return false;

    return true;
  }
}
