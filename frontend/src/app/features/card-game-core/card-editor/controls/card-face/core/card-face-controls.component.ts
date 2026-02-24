import { Component, computed, input, InputSignal, model, ModelSignal, Signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ComplexTextInputComponent } from '../../../../../../shared/input/text/complex/complex-text-input.component';
import { PairTextInputComponent } from '../../../../../../shared/input/text/pair/pair-text-input.component';
import { LabelComponent } from '../../../../../../shared/label/label.component';
import { ColorPickerComponent } from '../../../../../../shared/color-picker/color-picker.component';
import { BorderDimensions } from '../../../../../style/models/style';
import { DEFAULT_CARD_FACE_BACKGROUND_COLOR, DEFAULT_CARD_FACE_BORDER_COLOR, DEFAULT_CARD_FACE_BORDER_RADIUS, DEFAULT_CARD_FACE_BORDER_WIDTH, DEFAULT_CARD_FACE_HEIGHT, DEFAULT_CARD_FACE_WIDTH, MAX_BORDER_RADIUS, MAX_CARD_FACE_HEIGHT, MAX_CARD_FACE_WIDTH, MIN_BORDER_RADIUS, MIN_CARD_FACE_HEIGHT, MIN_CARD_FACE_WIDTH } from '../../../constants/card-editor.constants';
import { CardFaceBorderWidthComponent } from '../border-width/card-face-border-width.component';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { DEBOUNCE_TIME } from '../../../../../../utils/debounce/debounce.constants';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { clamp } from '../../../../../../utils/utils';
@Component({
  selector: 'app-card-face-controls',
  imports: [
    CardFaceBorderWidthComponent,
    ColorPickerComponent,
    FormsModule,
    LabelComponent,
    PairTextInputComponent,
    ComplexTextInputComponent
  ],
  templateUrl: './card-face-controls.component.html',
  styleUrl: './card-face-controls.component.scss'
})
export class CardFaceControlsComponent {
  // TODO: Get rid of all the services and make this a dumb component
  public readonly $cardFaceAttributesId: InputSignal<string> = input<string>('');

  protected readonly $header: Signal<string> = computed<string>(() => `Face: ${this.$cardFaceAttributesId()}`)

  public readonly $areBorderDimensionsEqual: InputSignal<boolean> = input<boolean>(false);

  public $cardFaceHexcode: ModelSignal<string> = model<string>(DEFAULT_CARD_FACE_BACKGROUND_COLOR);

  public $borderHexcode: ModelSignal<string> = model<string>(DEFAULT_CARD_FACE_BORDER_COLOR);

  public $borderRadius: ModelSignal<number> = model<number>(DEFAULT_CARD_FACE_BORDER_RADIUS);

  public readonly $minBorderRadius: InputSignal<number> = input<number>(MIN_BORDER_RADIUS);

  public readonly $maxBorderRadius: InputSignal<number> = input<number>(MAX_BORDER_RADIUS);

  public $cardFaceWidth: ModelSignal<number> = model<number>(DEFAULT_CARD_FACE_WIDTH);

  public $cardFaceHeight: ModelSignal<number> = model<number>(DEFAULT_CARD_FACE_HEIGHT);

  public readonly $minWidth: InputSignal<number> = input<number>(MIN_CARD_FACE_WIDTH);

  public readonly $minHeight: InputSignal<number> = input<number>(MIN_CARD_FACE_HEIGHT);

  public readonly $maxWidth: InputSignal<number> = input<number>(MAX_CARD_FACE_WIDTH);

  public readonly $maxHeight: InputSignal<number> = input<number>(MAX_CARD_FACE_HEIGHT);

  public $borderDimensions: ModelSignal<BorderDimensions> = model<BorderDimensions>({
    borderWidth: DEFAULT_CARD_FACE_BORDER_WIDTH,
    borderRect: {
      top: DEFAULT_CARD_FACE_BORDER_WIDTH,
      bottom: DEFAULT_CARD_FACE_BORDER_WIDTH,
      left: DEFAULT_CARD_FACE_BORDER_WIDTH,
      right: DEFAULT_CARD_FACE_BORDER_WIDTH
    }
  });

  private readonly borderRadius$$: Subject<number> = new Subject<number>();

  public readonly $editable: InputSignal<boolean> = input<boolean>(true); 

  constructor() { this.borderRadiusChange(); }

  // CHECKME: Do we want the debounce to be inside of the actual reusable component itself
  protected onBorderRadiusChange(value: number): void {
    this.borderRadius$$.next(value);
  }

  private borderRadiusChange(): Subscription {
    return this.borderRadius$$
      .pipe(
        debounceTime(DEBOUNCE_TIME),
        takeUntilDestroyed()
      )
      .subscribe((value: number) => {
        if (isNaN(value)) value = this.$minBorderRadius();

        this.$borderRadius.set(clamp(value, this.$minBorderRadius(), this.$maxBorderRadius()));
      });
  }
}
