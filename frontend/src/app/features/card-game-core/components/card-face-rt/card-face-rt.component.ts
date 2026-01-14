import { Component, computed, input, InputSignal, Signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularEditorConfig, AngularEditorModule } from '@kolkov/angular-editor';
import { MAX_CARD_FACE_HEIGHT, MAX_CARD_FACE_WIDTH, MIN_CARD_FACE_HEIGHT, MIN_CARD_FACE_WIDTH } from '../../utils/card-editor.constants';

@Component({
  selector: 'app-card-face-rt',
  imports: [AngularEditorModule, FormsModule],
  templateUrl: './card-face-rt.component.html',
  styleUrl: './card-face-rt.component.scss'
})
export class CardFaceRtComponent {
  // https://dev.to/christiankohler/how-to-use-resizeobserver-with-angular-9l5

  // We grab the BBCode from the card face element
  public readonly $content: InputSignal<string> = input<string>("");

  public readonly $cardFaceRtWidth: InputSignal<number> = input<number>(0.01);

  public readonly $cardFaceRtHeight: InputSignal<number> = input<number>(0.01);

  // TODO: Potentially refactor
  public readonly $minWidth: InputSignal<number> = input<number>(MIN_CARD_FACE_WIDTH);

  public readonly $minHeight: InputSignal<number> = input<number>(MIN_CARD_FACE_HEIGHT);

  public readonly $maxHeight: InputSignal<number> = input<number>(MAX_CARD_FACE_HEIGHT);

  constructor() {}

  protected get html(): string {
    return this.$content();
  }

  protected get config(): AngularEditorConfig {
    return {
      editable: false,
      spellcheck: false,
      height:`${this.$cardFaceRtHeight()}px`,
      width: `${this.$cardFaceRtWidth()}px`,
      minHeight: `${this.$minHeight()}px`,
      minWidth: `${this.$minWidth()}px`,
      maxHeight: `${this.$maxHeight()}px`,
      enableToolbar: false,
      showToolbar: false,
      outline: true
    }
  };
}
