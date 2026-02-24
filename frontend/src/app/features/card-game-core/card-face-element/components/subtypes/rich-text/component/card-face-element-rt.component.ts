import { Component, input, InputSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Style } from '../../../../../../style/models/style';
import { MAX_CARD_FACE_HEIGHT, MIN_CARD_FACE_HEIGHT, MIN_CARD_FACE_WIDTH } from '../../../../../card-editor/constants/card-editor.constants';

@Component({
  selector: 'app-card-face-element-rt',
  imports: [
    FormsModule
  ],
  templateUrl: './card-face-element-rt.component.html',
  styleUrl: './card-face-element-rt.component.scss'
})
export class CardFaceElementRtComponent {
  public readonly $content: InputSignal<string> = input<string>("");

  public readonly $cardFaceRtWidth: InputSignal<number> = input<number>(0.01);

  public readonly $cardFaceRtHeight: InputSignal<number> = input<number>(0.01);

  public readonly $minWidth: InputSignal<number> = input<number>(MIN_CARD_FACE_WIDTH);

  public readonly $minHeight: InputSignal<number> = input<number>(MIN_CARD_FACE_HEIGHT);

  public readonly $maxHeight: InputSignal<number> = input<number>(MAX_CARD_FACE_HEIGHT);

  // TODO: Do custom sanitisation in order to maintain the styling, we have that already, just gotta apply it here
  // FIXME: Currently text aligning doesn't work and is probably being sanitised

  constructor() {}

  // TODO: Allow the user to modify this styling, and pass it in instead
  protected getStyle(): Omit<Style, 'styleId'> {
    return {
      height:`${this.$cardFaceRtHeight()}px`,
      width: `${this.$cardFaceRtWidth()}px`,
      minHeight: `${this.$minHeight()}px`,
      minWidth: `${this.$minWidth()}px`,
      maxHeight: `${this.$maxHeight()}px`,
      border: '1px solid rgb(211, 211, 211)',
      borderRadius: '1rem',
      overflowWrap: 'break-word',
      padding: '0.5rem',
      overflow: 'scroll',
      /*scrollbarWidth: 'thin'*/ // TODO: Need to make this property for both frontend and backend
    }
  }
}
