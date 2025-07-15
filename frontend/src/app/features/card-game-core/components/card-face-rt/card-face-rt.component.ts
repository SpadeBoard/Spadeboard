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
  content: InputSignal<string> = input<string>("");
  contentComputed: Signal<string> = computed(() => this.content());

  cardFaceRtWidth: InputSignal<number> = input<number>(0.01);
  cardFaceRtWidthComputed: Signal<string> = computed(() => `${this.cardFaceRtWidth()}px`);
  
  cardFaceRtHeight: InputSignal<number> = input<number>(0.01);
  cardFaceRtHeightComputed: Signal<string> = computed(() => `${this.cardFaceRtHeight()}px`);

  // TODO: Potentially refactor
  minWidth: InputSignal<number> = input<number>(MIN_CARD_FACE_WIDTH);
  minHeight: InputSignal<number> = input<number>(MIN_CARD_FACE_HEIGHT);

  minWidthComputed: Signal<string> = computed(() => `${this.minWidth()}px`);
  minHeightComputed: Signal<string> = computed(() => `${this.minHeight()}px`);

  maxWidth: InputSignal<number> = input<number>(MAX_CARD_FACE_WIDTH);
  maxHeight: InputSignal<number> = input<number>(MAX_CARD_FACE_HEIGHT);

  maxWidthComputed: Signal<string> = computed(() => `${this.maxWidth()}px`);
  maxHeightComputed: Signal<string> = computed(() => `${this.maxHeight()}px`);

  constructor() {
  }

  get html(): string {
    return this.contentComputed();
  }

  get config(): AngularEditorConfig {
    return {
      editable: false,
      spellcheck: false,
      height: this.cardFaceRtHeightComputed(),
      width: this.cardFaceRtWidthComputed(),
      minHeight: this.minHeightComputed(),
      minWidth: this.minWidthComputed(),
      maxHeight: this.maxHeightComputed(),
      enableToolbar: false,
      showToolbar: false,
      outline: true
    }
  };
}
