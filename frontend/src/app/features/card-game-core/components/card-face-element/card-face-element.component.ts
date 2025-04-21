import { Component, effect, input, output } from '@angular/core';
import { CardFaceElementDto } from '../../models/card-face-element';
import { CardFaceRteComponent } from '../card-face-rte/card-face-rte.component';
import { CardFaceImageComponent } from '../card-face-image/card-face-image.component';

import { CommonModule } from '@angular/common';
import { CardFaceRtComponent } from '../card-face-rt/card-face-rt.component';
// Programmatic rendering
// https://angular.dev/guide/components/programmatic-rendering

// https://medium.com/ngconf/new-input-binding-for-ngcomponentoutlet-cb18a86a739d
// New binding: <ng-template *ngComponentOutlet="template; inputs: titleInputs" />

@Component({
  selector: 'app-card-face-element',
  imports: [CommonModule],
  templateUrl: './card-face-element.component.html',
  styleUrl: './card-face-element.component.css'
})
export class CardFaceElementComponent {
  cardFaceElementDtoInput = input<CardFaceElementDto>({
    cardFaceElement: {
      cardFaceElementId: 0,
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

  cardFaceSubelementInputs = {
    // TODO: Pass in the potential card face elements as well as front card face and back card face
    cardFaceElementDtoInput: {
      cardFaceElement: {
        cardFaceElementId: 0,
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
    } as CardFaceElementDto
  };
  
  cardFaceElementDtoChange = output<CardFaceElementDto>();

  // TODO: Grab these two components, or somehow just make this one thing
  // Really the goal is to switch out the HTML dynamically
  // Either have multiple templates or use multiple components
  // Can't I just have multiple HTML files and swap out the templates?
  
  // REFERENCES: 
  // https://www.youtube.com/watch?v=18knOB6SQ-M
  // https://material.angular.io/cdk/text-field/overview
  // TODO: Figure out DndWrapper auto resizing, use css styling, make css file?
  getCardFaceElementComponent() {
    // Returns component class
    switch(this.cardFaceElementDtoInput().cardFaceElement.cardFaceElementType) {
      case 'rte':
        return CardFaceRtComponent;
      case 'image':
        return CardFaceImageComponent;
      default: 
        return null;
    }
  }

  constructor() {
    effect(() => {
      let cardFaceElementDto = this.cardFaceElementDtoInput();

      if (cardFaceElementDto.cardFaceElement.cardFaceElementId > 0) {
        this.cardFaceSubelementInputs.cardFaceElementDtoInput = cardFaceElementDto;
      }
    });

  }

  // TODO: When style changes, send it to the directive
}
