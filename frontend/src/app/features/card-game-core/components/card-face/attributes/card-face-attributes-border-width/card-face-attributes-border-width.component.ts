import { Component, effect, ElementRef, inject, input, InputSignal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { clamp } from '../../../../../../utils/utils';
import { BorderDimensions } from '../../../../../style/models/style';
import { CardEditorControlsDesignCardFaceAttributesService } from '../../../../services/card-game-core/card-editor/controls/design/card-face/card-editor-controls-design-card-face-attributes.service';
import { MAX_BORDER_WIDTH, MIN_BORDER_WIDTH } from '../../../../utils/card-editor.constants';

@Component({
  selector: 'app-card-face-attributes-border-width',
  imports: [FormsModule],
  templateUrl: './card-face-attributes-border-width.component.html',
  styleUrl: './card-face-attributes-border-width.component.scss'
})
export class CardFaceAttributesBorderWidthComponent {
  // Use to set the values properly in the inputs, for some reason ngModel can't sync these properly
  @ViewChild('borderWidthInput') borderWidthRef!: ElementRef<HTMLInputElement>;
  @ViewChild('borderTopInput') borderTopRef!: ElementRef<HTMLInputElement>;
  @ViewChild('borderBottomInput') borderBottomRef!: ElementRef<HTMLInputElement>;
  @ViewChild('borderLeftInput') borderLeftRef!: ElementRef<HTMLInputElement>;
  @ViewChild('borderRightInput') borderRightRef!: ElementRef<HTMLInputElement>;

  private readonly cardEditorControlsDesignCardFaceAttributesService: CardEditorControlsDesignCardFaceAttributesService = inject(CardEditorControlsDesignCardFaceAttributesService);

  protected isMixed: boolean = false;

  protected shouldDropDown: boolean = false;

  protected readonly minBorderDimensions: number = MIN_BORDER_WIDTH;
  protected readonly maxBorderDimensions: number = MAX_BORDER_WIDTH;
  
  public areDimensionsEqual: InputSignal<boolean> = input<boolean>(false);
  
  constructor() {
    effect(() => {
      this.isMixed = !this.areDimensionsEqual();
    });
  }

  get borderDimensions(): BorderDimensions {
    return this.cardEditorControlsDesignCardFaceAttributesService.borderDimensions;
  }

  set borderDimensions(borderDimensions: BorderDimensions) {
    this.cardEditorControlsDesignCardFaceAttributesService.borderDimensions = borderDimensions;
    this.cardEditorControlsDesignCardFaceAttributesService.setOnBorderDimensionsChange(borderDimensions);
  }

  set borderWidthValue(value: number) {
    value = clamp(value, MIN_BORDER_WIDTH, MAX_BORDER_WIDTH);

    this.borderDimensions =
    {
      borderWidth: value,
      borderRect: {
        top: value,
        bottom: value,
        left: value,
        right: value
      }
    }

    if (this.borderWidthRef.nativeElement) this.borderWidthRef.nativeElement.value = `${value}`;
    if (this.borderTopRef.nativeElement) this.borderTopRef.nativeElement.value = `${value}`;
    if (this.borderBottomRef.nativeElement) this.borderBottomRef.nativeElement.value = `${value}`;
    if (this.borderLeftRef.nativeElement) this.borderLeftRef.nativeElement.value = `${value}`;
    if (this.borderRightRef.nativeElement) this.borderRightRef.nativeElement.value = `${value}`;
  }

  get borderWidthValue() {
    return this.cardEditorControlsDesignCardFaceAttributesService.borderDimensions.borderWidth;
  }

  get borderTopWidthValue() {
    return this.cardEditorControlsDesignCardFaceAttributesService.borderDimensions.borderRect.top;
  }

   get borderBottomWidthValue() {
    return this.cardEditorControlsDesignCardFaceAttributesService.borderDimensions.borderRect.bottom;
  }

   get borderLeftWidthValue() {
    return this.cardEditorControlsDesignCardFaceAttributesService.borderDimensions.borderRect.left;
  }

   get borderRightWidthValue() {
    return this.cardEditorControlsDesignCardFaceAttributesService.borderDimensions.borderRect.right;
  }

  set borderLeftWidthValue(value: number) {
    value = clamp(value, MIN_BORDER_WIDTH, MAX_BORDER_WIDTH);

    this.borderDimensions = ({
      ...this.borderDimensions,
      borderRect: {
        ...this.borderDimensions.borderRect,
        left: value
      }
    });

    if (this.borderLeftRef.nativeElement) this.borderLeftRef.nativeElement.value = `${value}`;
  }

  set borderRightWidthValue(value: number) {
    value = clamp(value, MIN_BORDER_WIDTH, MAX_BORDER_WIDTH);

    this.borderDimensions = ({
      ...this.borderDimensions,
      borderRect: {
        ...this.borderDimensions.borderRect,
        right: value
      }
    });

    if (this.borderRightRef.nativeElement) this.borderRightRef.nativeElement.value = `${value}`;
  }

  set borderTopWidthValue(value: number) {
    value = clamp(value, MIN_BORDER_WIDTH, MAX_BORDER_WIDTH);

    this.borderDimensions = ({
      ...this.borderDimensions,
      borderRect: {
        ...this.borderDimensions.borderRect,
        top: value
      }
    });

    if (this.borderTopRef.nativeElement) this.borderTopRef.nativeElement.value = `${value}`;
  }

  set borderBottomWidthValue(value: number) {
    value = clamp(value, MIN_BORDER_WIDTH, MAX_BORDER_WIDTH);

    this.borderDimensions = ({
      ...this.borderDimensions,
      borderRect: {
        ...this.borderDimensions.borderRect,
        bottom: value
      }
    });

    if (this.borderBottomRef.nativeElement) this.borderBottomRef.nativeElement.value = `${value}`;
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
