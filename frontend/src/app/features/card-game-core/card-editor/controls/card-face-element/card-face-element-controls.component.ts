import { Component, computed, input, InputSignal, model, ModelSignal, output, OutputEmitterRef, Signal } from '@angular/core';
import { PairTextInputComponent } from '../../../../../shared/input/text/pair/pair-text-input.component';
import { LabelComponent } from '../../../../../shared/label/label.component';
import { MAX_CARD_FACE_HEIGHT, MAX_CARD_FACE_WIDTH, MIN_CARD_FACE_WIDTH } from '../../constants/card-editor.constants';
import { CardFaceElementLayeringComponent } from '../../../components/card-face-element-layering/card-face-element-layering.component';

@Component({
  selector: 'app-card-face-element-controls',
  imports: [
    LabelComponent,
    PairTextInputComponent,
    CardFaceElementLayeringComponent
  ],
  templateUrl: './card-face-element-controls.component.html',
  styleUrl: './card-face-element-controls.component.scss'
})
// TODO: Make the child components dumb and move all the logic to the parent
export class CardFaceElementControlsComponent {
  public readonly $currentCardFaceElementId: InputSignal<string> = input<string>('');

  public readonly $header: Signal<string> = computed<string>(() => `Element: ${this.$currentCardFaceElementId()}`);

  public $cardFaceElementWidth: ModelSignal<number> = model<number>(0);

  public $cardFaceElementHeight: ModelSignal<number> = model<number>(0);

  public readonly $minCardFaceElementWidth: InputSignal<number> = input<number>(MIN_CARD_FACE_WIDTH);

  public readonly $minCardFaceElementHeight: InputSignal<number> = input<number>(MIN_CARD_FACE_WIDTH);

  public readonly $maxCardFaceElementWidth: InputSignal<number> = input<number>(MAX_CARD_FACE_WIDTH);

  public readonly $maxCardFaceElementHeight: InputSignal<number> = input<number>(MAX_CARD_FACE_HEIGHT);

  public $cardFaceElementX: ModelSignal<number> = model<number>(0);

  public $cardFaceElementY: ModelSignal<number> = model<number>(0);

  public readonly $minCardFaceElementX: InputSignal<number> = input<number>(0);

  public readonly $minCardFaceElementY: InputSignal<number> = input<number>(0);

  public readonly $maxCardFaceElementX: InputSignal<number> = input<number>(MAX_CARD_FACE_WIDTH);

  public readonly $maxCardFaceElementY: InputSignal<number> = input<number>(MAX_CARD_FACE_HEIGHT);

  public readonly $setLayeringOperation: OutputEmitterRef<'front' | 'back' | 'forward' | 'backward'> = output<'front' | 'back' | 'forward' | 'backward'>();

  // TODO: Use this and pass this up to control the elements
  public $aspectRatioLocked: ModelSignal<boolean> = model<boolean>(false);

  protected readonly $aspectRatioIcon: Signal<string> = computed<string>(() => (this.$aspectRatioLocked())? '/chain-icon.svg' : '/broken-chain-icon.svg');

  public readonly $editable: InputSignal<boolean> = input<boolean>(true);
  
  constructor() {}

  protected setLayeringOperation(operation: 'front' | 'back' | 'forward' | 'backward'): void {
    this.$setLayeringOperation.emit(operation);
  }

  protected onAspectRatioToggle(event: Event): void {
    this.$aspectRatioLocked.set(!this.$aspectRatioLocked());
  }
}
