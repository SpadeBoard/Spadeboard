import { Component, ElementRef, input, InputSignal, model, ModelSignal, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { debounceTime, filter, Subject } from 'rxjs';
import { ComplexTextInputComponent } from '../input/text/complex/complex-text-input.component';
import { convertShortHexToLongForm, isShortHex, isValidHexaCode, validateHex } from '../../utils/hex.utils';
import { DEBOUNCE_TIME } from '../../utils/debounce/debounce.constants';

@Component({
  selector: 'app-color-picker',
  imports: [
    FormsModule,
    ComplexTextInputComponent
  ],
  templateUrl: './color-picker.component.html',
  styleUrl: './color-picker.component.scss'
})
export class ColorPickerComponent {
  public readonly $colorPickerName: InputSignal<string> = input<string>("");

  public $hexcode: ModelSignal<string> = model<string>("");

  public $hexInput: ModelSignal<string> = model<string>("");

  @ViewChild('colorHexInput') hexInputRef: ElementRef<HTMLInputElement> = {} as ElementRef<HTMLInputElement>;

  private readonly onShortHexChange$$: Subject<string>= new Subject<string>();

  public readonly $readonly: InputSignal<boolean> = input<boolean>(false);
  
  constructor() {
    this.onShortHexChange();
  }

  protected setHexInput(hex: string): void {
    this.$hexInput.set(hex);

    // Forces the input to immediately update, not sure why it won't here
    if (this.hexInputRef.nativeElement) this.hexInputRef.nativeElement.value = hex;
  }

  protected onShortHexChange(): void {
    this.onShortHexChange$$
      .pipe(
        debounceTime(DEBOUNCE_TIME),
        filter((color: string) => isShortHex(color.length) && isValidHexaCode(color)),  // NOTE: Should be fine since it drops earlier values
        takeUntilDestroyed()
      )
      .subscribe((color: string) => {
        let hex: string = validateHex(color);
        this.$hexcode.set(convertShortHexToLongForm(hex));
      })
  }

  protected onColorChange(value: string): void {
    // If it's greater than 7, then we get rid of the rest of it and validate it
    value = this.clampHexInput(value);

    // We want to debounce this, if the user doesn't continue typing
    // We'll assume that they're done
    // Just always emit it because there'll be a filter for short hexes so it'll never pass through if it's already a long hex
    /****************** SHORTFORM **********************/
    this.onShortHexChange$$.next(value);

    // ***************************** LONGFORM *********************************** //

    // So now we actually validate the nature of the hex and actually set it
    if (!isShortHex(value.length) && isValidHexaCode(value))
      this.$hexcode.set(value);
  }

  private clampHexInput(value: string): string {
    value = value.substring(0, 7);
    this.setHexInput(value);

    // NOTE: This might look strange, but it's a null value and therefore
    // The color just doesn't exist, that's how you set alpha to 0
    if (value.length <= 0) this.$hexcode.set(value);

    return value;
  }
}
