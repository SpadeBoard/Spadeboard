import { Component, computed, effect, input, InputSignal, model, ModelSignal, Signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BorderDimensions } from '../../../style/models/style';
import { DEFAULT_CARD_FACE_BORDER_WIDTH } from '../../utils/card-editor.constants';

@Component({
  selector: 'app-card-face-attributes-border-width',
  imports: [FormsModule],
  templateUrl: './card-face-attributes-border-width.component.html',
  styleUrl: './card-face-attributes-border-width.component.css'
})
export class CardFaceAttributesBorderWidthComponent {
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
  areDimensionsEqualComputed: Signal<boolean> = computed(() => this.areDimensionsEqual());
  
  isMixed: boolean = false;

  shouldDropDown: boolean = false;

  constructor() {
    effect(() => {
      this.isMixed = !this.areDimensionsEqual();
    });
  }

  onBorderWidthChange(value: number) {
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
    this.borderDimensions.set({
      ...this.borderDimensions(),
      borderRect: {
        ...this.borderDimensions().borderRect,
        left: value
      }
    });
  }

  set borderRightWidthValue(value: number) {
    this.borderDimensions.set({
      ...this.borderDimensions(),
      borderRect: {
        ...this.borderDimensions().borderRect,
        right: value
      }
    });
  }

  set borderTopWidthValue(value: number) {
    this.borderDimensions.set({
      ...this.borderDimensions(),
      borderRect: {
        ...this.borderDimensions().borderRect,
        top: value
      }
    });
  }

  set borderBottomWidthValue(value: number) {
    this.borderDimensions.set({
      ...this.borderDimensions(),
      borderRect: {
        ...this.borderDimensions().borderRect,
        bottom: value
      }
    });
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
