import { Component, input, InputSignal } from '@angular/core';
import { DEFAULT_CARD_FACE_DIMENSIONS, DEFAULT_CARD_FACE_PLACEHOLDER_ALT, DEFAULT_CARD_FACE_PLACEHOLDER_SRC } from '../../../card-face/constants/card-face.constants';

@Component({
  selector: 'app-card-placeholder',
  imports: [],
  templateUrl: './card-placeholder.component.html',
  styleUrl: './card-placeholder.component.scss'
})
export class CardPlaceholderComponent {
  public readonly $title: InputSignal<string> = input<string>("New");
  
  public readonly $src: InputSignal<string> = input<string>(DEFAULT_CARD_FACE_PLACEHOLDER_SRC);
  public readonly $alt: InputSignal<string> = input<string>(DEFAULT_CARD_FACE_PLACEHOLDER_ALT);
  public readonly $width: InputSignal<number> = input<number>(DEFAULT_CARD_FACE_DIMENSIONS.width);
  public readonly $height: InputSignal<number> = input<number>(DEFAULT_CARD_FACE_DIMENSIONS.height);
}
