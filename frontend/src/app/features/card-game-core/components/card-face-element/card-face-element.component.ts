import { Component, input, output } from '@angular/core';
import { CardFaceElement } from '../../models/card-face-element';
import { CardFaceRteComponent } from '../card-face-rte/card-face-rte.component';
import { CardFaceImageComponent } from '../card-face-image/card-face-image.component';

import { getStyle } from '../../../style/utils/get-style';
import { CommonModule } from '@angular/common';
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
  cardFaceElement = input<CardFaceElement>({
    cardFaceElementId: 0,
    cardFaceId: 0,
    cardFaceElementContent: '',
    cardFaceElementType: '',
    
    dndItem: {
      dndItemId: 0,
      isDraggable: false,
      isDroppable: false,
      dndPosition: { x: 0, y: 0 }
    },
    
    style: {
      styleId: 0,
      minHeight: '300px',
      maxHeight: '300px',
      minWidth: '300px',
      maxWidth: '300px',
      width: '300px',
      height: '300px'
    }
  });
  
  cardFaceElementChange = output<CardFaceElement>();

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
    if (this.cardFaceElement().cardFaceElementType === 'rte') {
      return CardFaceRteComponent;
    } else {
      return CardFaceImageComponent;
    }
  }

  constructor() {}

  // TODO: When style changes, send it to the directive
}
