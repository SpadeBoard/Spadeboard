import { Component, computed, input, InputSignal, Signal } from '@angular/core';
import { DEFAULT_CARD_FACE_DIMENSIONS, DEFAULT_CARD_FACE_PLACEHOLDER_ALT, DEFAULT_CARD_FACE_PLACEHOLDER_SRC } from '../../utils/card-face.constants';

@Component({
  selector: 'app-new-card-template-collection',
  imports: [],
  templateUrl: './new-card-template-collection.component.html',
  styleUrl: './new-card-template-collection.component.scss'
})
export class NewCardTemplateCollectionComponent {
  title: InputSignal<string> = input<string>("New");
  readonly titleComputed: Signal<string> = computed(() => this.title());
  
  readonly src: string = DEFAULT_CARD_FACE_PLACEHOLDER_SRC;
  readonly alt: string = DEFAULT_CARD_FACE_PLACEHOLDER_ALT;
  readonly width: number = DEFAULT_CARD_FACE_DIMENSIONS.width;
  readonly height: number = DEFAULT_CARD_FACE_DIMENSIONS.height;
}
