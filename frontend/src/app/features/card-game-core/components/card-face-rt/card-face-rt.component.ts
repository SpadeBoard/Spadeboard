import { Component, effect, input } from '@angular/core';
import { bbCodeToHtml, html, decodeHtml } from '../../utils/rich-text-sanitizer';
import { CardFaceElementDto } from '../../models/card-face-element';

@Component({
  selector: 'app-card-face-rt',
  imports: [],
  templateUrl: './card-face-rt.component.html',
  styleUrl: './card-face-rt.component.css'
})
export class CardFaceRtComponent {
  cardFaceElementDtoInput = input<CardFaceElementDto>({
    cardFaceElement: {
      cardFaceElementId: 0,
      cardFaceId: 0,
      cardFaceElementContent: '',
      cardFaceElementType: '',
    },
    dndItemDto: {
      dndItem: {
        dndItemId: 0,
        isDraggable: false,
        isDroppable: false
      },
      dndPosition: {
        x: 0,
        y: 0
      }
    }
  });
  
  // We grab the BBCode from the card face element

  html: html = {
    content: "",
    attrs: {
      style: {
        styleId: 0
      },
      dndPosition: {
        x: 0,
        y: 0
      }
    }
  }

  // TODO: Effect in constructor, check to make sure its type is rte
  constructor() {
    effect(() => {
      if (this.cardFaceElementDtoInput().cardFaceElement.cardFaceElementId > 0) {
        let cardFaceElementDto: CardFaceElementDto = this.cardFaceElementDtoInput();
        this.setHtml(cardFaceElementDto);
      }
    });
  }

  // TODO: We have a card face element dto input

  // TODO: Pass in card face element content to bbCodeToHtml
  setHtmlContent(bbCode: string): void {
    this.html.content = bbCodeToHtml(bbCode);
  }

  setHtml(cardFaceElementDto: CardFaceElementDto): void {
    this.setHtmlContent(cardFaceElementDto.cardFaceElement.cardFaceElementContent);

    if (cardFaceElementDto.cardFaceElement.style === undefined)
      return;

    this.html.attrs = {
      style: cardFaceElementDto.cardFaceElement.style,
      dndPosition: cardFaceElementDto.dndItemDto.dndPosition
    }
  }

  getInnerHtml(): string | null {
    return decodeHtml(this.html.content);
  }

  // TODO: Create a style and grab the DndPosition
}
