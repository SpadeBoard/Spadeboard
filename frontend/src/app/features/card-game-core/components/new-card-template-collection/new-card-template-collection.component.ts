import { Component, input, InputSignal } from '@angular/core';
import { DEFAULT_CARD_FACE_DIMENSIONS, DEFAULT_CARD_FACE_PLACEHOLDER_ALT, DEFAULT_CARD_FACE_PLACEHOLDER_SRC } from '../../utils/card-face.constants';

@Component({
  selector: 'app-new-card-template-collection',
  imports: [],
  templateUrl: './new-card-template-collection.component.html',
  styleUrl: './new-card-template-collection.component.scss'
})
export class NewCardTemplateCollectionComponent {
  public title: InputSignal<string> = input<string>("New");
  
  protected readonly src: string = DEFAULT_CARD_FACE_PLACEHOLDER_SRC;
  protected readonly alt: string = DEFAULT_CARD_FACE_PLACEHOLDER_ALT;
  protected readonly width: number = DEFAULT_CARD_FACE_DIMENSIONS.width;
  protected readonly height: number = DEFAULT_CARD_FACE_DIMENSIONS.height;
}
