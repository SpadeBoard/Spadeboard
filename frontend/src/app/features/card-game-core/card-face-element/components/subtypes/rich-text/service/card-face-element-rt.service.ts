import { Injectable } from '@angular/core';
import { CardFaceElement, CardFaceElementPerCardFace, CardFaceElementRt } from  '../../../../models/card-face-element';
import { CardFaceElementService } from '../../../../services/core/card-face-element.service';

@Injectable({
  providedIn: 'root'
})
export class CardFaceElementRtService extends CardFaceElementService {
  constructor() {
    super();
  }

  // TODO: Make this more robust or rename it to something clearer
  public getElements(cardFaceElementsPerCardFace: CardFaceElementPerCardFace[]): CardFaceElementPerCardFace[] {
    return cardFaceElementsPerCardFace.filter((cardFaceElementPerCardFace: CardFaceElementPerCardFace) => cardFaceElementPerCardFace.cardFaceElement.cardFaceElementType === 'Rt');
  }

  public getCardFaceElementRt(cardFaceElement: CardFaceElement): CardFaceElementRt | undefined {
      if (cardFaceElement.cardFaceElementType !== "Rt")
          return;
  
      return (cardFaceElement as CardFaceElementRt);
  }

  public getElement(cardFaceElementId: string, cardFaceElementsPerCardFace: CardFaceElementPerCardFace[]): CardFaceElementRt {
    let cardFaceElementPerCardFace: CardFaceElementPerCardFace | undefined = this.getCardFaceElementPerCardFace(cardFaceElementId, cardFaceElementsPerCardFace, 'Rt');

    if (!cardFaceElementPerCardFace) throw new Error("Card face element RT: There is no current card face element per card face to set attributes");

    let cardFaceElementRt: CardFaceElementRt | undefined = this.getCardFaceElementRt(cardFaceElementPerCardFace.cardFaceElement);

    if (!cardFaceElementRt) throw new Error("No card face element rich text");

    return cardFaceElementRt;
  }

  public getRt(cardFaceElementId: string, cardFaceElementsPerCardFace: CardFaceElementPerCardFace[]): string {
   return this.getElement(cardFaceElementId, cardFaceElementsPerCardFace).cardFaceElementContent;
  }

  public setRt(cardFaceElementId: string, text: string, cardFaceElementsPerCardFace: CardFaceElementPerCardFace[]): void {
    let cardFaceElementRt: CardFaceElementRt | undefined = this.getElement(cardFaceElementId, cardFaceElementsPerCardFace);

    if (cardFaceElementRt === undefined) throw new Error("Card face element rich text is undefined or not an RTE");

    cardFaceElementRt.cardFaceElementContent = text;
  }

  public isRt(cardFaceElementId: string, cardFaceElementsPerCardFace: CardFaceElementPerCardFace[]): boolean {
    let cardFaceElementPerCardFace: CardFaceElementPerCardFace | undefined = this.getCardFaceElementPerCardFace(cardFaceElementId, cardFaceElementsPerCardFace, 'Rt');

    if (!cardFaceElementPerCardFace) return false;

    let cardFaceElementRt: CardFaceElementRt | undefined = this.getCardFaceElementRt(cardFaceElementPerCardFace.cardFaceElement);

    if (!cardFaceElementRt) return false;

    return true;
  }
}
