import { Component, effect, ElementRef, input, InputSignal, model, ModelSignal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { clamp } from '../../../../utils/utils';
import { BorderDimensions } from '../../../style/models/style';
import { DEFAULT_CARD_FACE_BORDER_WIDTH, MAX_BORDER_WIDTH, MIN_BORDER_WIDTH } from '../../utils/card-editor.constants';

@Component({
  selector: 'app-card-face-attributes-border-width',
  imports: [FormsModule],
  templateUrl: './card-face-attributes-border-width.component.html',
  styleUrl: './card-face-attributes-border-width.component.css'
})
export class CardFaceAttributesBorderWidthComponent {
  // Use to set the values properly in the inputs, for some reason ngModel can't sync these properly
  @ViewChild('borderWidthInput') borderWidthRef!: ElementRef<HTMLInputElement>;
  @ViewChild('borderTopInput') borderTopRef!: ElementRef<HTMLInputElement>;
  @ViewChild('borderBottomInput') borderBottomRef!: ElementRef<HTMLInputElement>;
  @ViewChild('borderLeftInput') borderLeftRef!: ElementRef<HTMLInputElement>;
  @ViewChild('borderRightInput') borderRightRef!: ElementRef<HTMLInputElement>;

  borderDimensions: ModelSignal<BorderDimensions> = model<BorderDimensions>(
    {
      borderWidth: DEFAULT_CARD_FACE_BORDER_WIDTH,
      borderRect: {
        top: DEFAULT_CARD_FACE_BORDER_WIDTH,
        bottom: DEFAULT_CARD_FACE_BORDER_WIDTH,
        left: DEFAULT_CARD_FACE_BORDER_WIDTH,
        right: DEFAULT_CARD_FACE_BORDER_WIDTH
      }
    }
  )
  
  areDimensionsEqual: InputSignal<boolean> = input<boolean>(false);
  
  isMixed: boolean = false;

  shouldDropDown: boolean = false;

  readonly minBorderDimensions: number = MIN_BORDER_WIDTH;
  readonly maxBorderDimensions: number = MAX_BORDER_WIDTH;

  constructor() {
    effect(() => {
      this.isMixed = !this.areDimensionsEqual();
    });
  }

  set borderWidthValue(value: number) {
    value = clamp(value, MIN_BORDER_WIDTH, MAX_BORDER_WIDTH);

    this.borderDimensions.set(
      {
        borderWidth: value,
        borderRect: {
          top: value,
          bottom: value,
          left: value,
          right: value
        }
      }
    )

    if (this.borderWidthRef.nativeElement) this.borderWidthRef.nativeElement.value = `${value}`;
    if (this.borderTopRef.nativeElement) this.borderTopRef.nativeElement.value = `${value}`;
    if (this.borderBottomRef.nativeElement) this.borderBottomRef.nativeElement.value = `${value}`;
    if (this.borderLeftRef.nativeElement) this.borderLeftRef.nativeElement.value = `${value}`;
    if (this.borderRightRef.nativeElement) this.borderRightRef.nativeElement.value = `${value}`;
  }

  get borderWidthValue() {
    return this.borderDimensions().borderWidth;
  }

  get borderTopWidthValue() {
    return this.borderDimensions().borderRect.top;
  }

   get borderBottomWidthValue() {
    return this.borderDimensions().borderRect.bottom;
  }

   get borderLeftWidthValue() {
    return this.borderDimensions().borderRect.left;
  }

   get borderRightWidthValue() {
    return this.borderDimensions().borderRect.right;
  }

  set borderLeftWidthValue(value: number) {
    value = clamp(value, MIN_BORDER_WIDTH, MAX_BORDER_WIDTH);

    this.borderDimensions.set({
      ...this.borderDimensions(),
      borderRect: {
        ...this.borderDimensions().borderRect,
        left: value
      }
    });

    if (this.borderLeftRef.nativeElement) this.borderLeftRef.nativeElement.value = `${value}`;
  }

  set borderRightWidthValue(value: number) {
    value = clamp(value, MIN_BORDER_WIDTH, MAX_BORDER_WIDTH);

    this.borderDimensions.set({
      ...this.borderDimensions(),
      borderRect: {
        ...this.borderDimensions().borderRect,
        right: value
      }
    });

    if (this.borderRightRef.nativeElement) this.borderRightRef.nativeElement.value = `${value}`;
  }

  set borderTopWidthValue(value: number) {
    value = clamp(value, MIN_BORDER_WIDTH, MAX_BORDER_WIDTH);

    this.borderDimensions.set({
      ...this.borderDimensions(),
      borderRect: {
        ...this.borderDimensions().borderRect,
        top: value
      }
    });

    if (this.borderTopRef.nativeElement) this.borderTopRef.nativeElement.value = `${value}`;
  }

  set borderBottomWidthValue(value: number) {
    value = clamp(value, MIN_BORDER_WIDTH, MAX_BORDER_WIDTH);

    this.borderDimensions.set({
      ...this.borderDimensions(),
      borderRect: {
        ...this.borderDimensions().borderRect,
        bottom: value
      }
    });

    if (this.borderBottomRef.nativeElement) this.borderBottomRef.nativeElement.value = `${value}`;
  }

  onDropdownActivation(event: Event) {
    this.shouldDropDown = !this.shouldDropDown;
  }

  onMixedClick(event: Event) {
    this.isMixed = false;
  }

  onBorderWidthMixedChange(event: Event) {
    this.isMixed = true;
  }
}
