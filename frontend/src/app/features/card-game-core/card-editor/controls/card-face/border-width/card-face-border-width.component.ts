import { Component, effect, ElementRef, input, InputSignal, model, ModelSignal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { clamp } from '../../../../../../utils/utils';
import { BorderDimensions } from '../../../../../style/models/style';
import { DEFAULT_CARD_FACE_BORDER_WIDTH, MAX_BORDER_WIDTH, MIN_BORDER_WIDTH } from '../../../constants/card-editor.constants';
import { ComplexTextInputComponent } from '../../../../../../shared/input/text/complex/complex-text-input.component';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { DEBOUNCE_TIME } from '../../../../../../utils/debounce/debounce.constants';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DropdownComponent } from '../../../../../../shared/dropdown/dropdown.component';

@Component({
  selector: 'app-card-face-border-width',
  imports: [
    FormsModule,
    ComplexTextInputComponent,
    DropdownComponent
  ],
  templateUrl: './card-face-border-width.component.html',
  styleUrl: './card-face-border-width.component.scss'
})
export class CardFaceBorderWidthComponent {
  protected isMixed: boolean = false;

  protected shouldDropDown: boolean = false;

  public $areBorderDimensionsEqual: InputSignal<boolean> = input<boolean>(false);

  public readonly $minBorderDimensions: InputSignal<number> = input<number>(MIN_BORDER_WIDTH);

  public readonly $maxBorderDimensions: InputSignal<number> = input<number>(MAX_BORDER_WIDTH);

  public $borderDimensions: ModelSignal<BorderDimensions> = model<BorderDimensions>({
    borderWidth: DEFAULT_CARD_FACE_BORDER_WIDTH,
    borderRect: {
      top: DEFAULT_CARD_FACE_BORDER_WIDTH,
      bottom: DEFAULT_CARD_FACE_BORDER_WIDTH,
      left: DEFAULT_CARD_FACE_BORDER_WIDTH,
      right: DEFAULT_CARD_FACE_BORDER_WIDTH
    }
  });

  private borderDimension$$: Subject<{
    type: 'width' | 'top' | 'bottom' | 'left' | 'right',
    value: number
  }> = new Subject<{
    type: 'width' | 'top' | 'bottom' | 'left' | 'right',
    value: number
  }>();

  public readonly $editable: InputSignal<boolean> = input<boolean>(true); 

  constructor() {
    effect(() => {
      this.isMixed = !this.$areBorderDimensionsEqual();
    });

    this.borderDimensionChange();
  }

  protected onBorderWidthChange(value: number) {
    this.borderDimension$$.next({type: "width", value});
  }

  protected onBorderLeftChange(value: number) {
    this.borderDimension$$.next({type: "left", value});
  }

  protected onBorderRightChange(value: number) {
    this.borderDimension$$.next({type: "right", value});
  }

  protected onBorderTopChange(value: number) {
    this.borderDimension$$.next({type: "top", value});
  }

  protected onBorderBottomChange(value: number) {
    this.borderDimension$$.next({type: "bottom", value});
  }

  private borderDimensionChange(): Subscription {
    return this.borderDimension$$
      .pipe(
        debounceTime(DEBOUNCE_TIME),
        takeUntilDestroyed()
      )
      .subscribe((result: {
        type: "width" | "top" | "bottom" | "left" | "right";
        value: number;
      }) => {
        let {type, value} = result;

        value = clamp(value, MIN_BORDER_WIDTH, MAX_BORDER_WIDTH);

        switch (type) {
          case 'width':
            this.$borderDimensions.set({
              borderWidth: value,
              borderRect: {
                top: value,
                bottom: value,
                left: value,
                right: value
              }
            });
            break;
          case 'left':
            this.$borderDimensions.update((bd: BorderDimensions) => ({
              ...bd, borderRect: {
                ...bd.borderRect,
                left: value
              }
            }));
            break;
          case 'right':
            this.$borderDimensions.update((bd: BorderDimensions) => ({
              ...bd, borderRect: {
                ...bd.borderRect,
                right: value
              }
            }));
            break;
          case 'top':
            this.$borderDimensions.update((bd: BorderDimensions) => ({
              ...bd, borderRect: {
                ...bd.borderRect,
                top: value
              }
            }));
            break;
          case 'bottom':
            this.$borderDimensions.update((bd: BorderDimensions) => ({
              ...bd, borderRect: {
                ...bd.borderRect,
                bottom: value
              }
            }));
          break;
        }
      });
  }

  protected onDropdownActivation(event: Event): void {
    this.shouldDropDown = !this.shouldDropDown;
  }

  protected onMixedClick(event: Event): void {
    this.isMixed = false;
  }

  protected onBorderWidthMixedChange(event: Event): void {
    this.isMixed = true;
  }
}
