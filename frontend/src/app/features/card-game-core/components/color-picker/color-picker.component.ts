import { Component, ElementRef, input, InputSignal, model, ModelSignal, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { debounceTime, filter, Subject } from 'rxjs';

@Component({
  selector: 'app-color-picker',
  imports: [FormsModule],
  templateUrl: './color-picker.component.html',
  styleUrl: './color-picker.component.scss'
})
export class ColorPickerComponent {
  // https://www.angulararchitects.io/en/blog/component-communication-with-signals-inputs-two-way-bindings-and-content-view-queries/

  colorPickerName: InputSignal<string> = input<string>("");

  hexcode: ModelSignal<string> = model<string>("");
  hexInput: ModelSignal<string> = model<string>("");

  @ViewChild('colorHexInput') hexInputRef!: ElementRef<HTMLInputElement>;

  private readonly onShortHexChange$$ = new Subject<string>();

   constructor() {
    this.onShortHexChange();
   }

   isValidHexLength(length: number) {
    return length == 4 || length == 7;
   }

   setHexInput(hex: string) {
    this.hexInput.set(hex);

    // Forces the input to immediately update, not sure why it won't here
    if (this.hexInputRef.nativeElement) this.hexInputRef.nativeElement.value = hex;
   }

  isValidHexCharacter(char: string): boolean {
    // Handle empty string or longer than 1 char (just in case)
    if (char.length !== 1) return false;

    let c: any = char.charCodeAt(0);

    let isDigit: boolean = c >= '0'.charCodeAt(0) && c <= '9'.charCodeAt(0);
    let isLower: boolean = c >= 'a'.charCodeAt(0) && c <= 'f'.charCodeAt(0);
    let isUpper: boolean = c >= 'A'.charCodeAt(0) && c <= 'F'.charCodeAt(0);
    return isDigit || isLower || isUpper;
  }

  // https://www.geeksforgeeks.org/check-if-a-given-string-is-a-valid-hexadecimal-color-code-or-not/
  isValidHexaCode(str: string) {
    if (str[0] != '#')
      return false;

    if (!this.isValidHexLength(str.length))
      return false;

    for (let i = 1; i < str.length; i++)
     if (!this.isValidHexCharacter(str[i]))
        return false;

    return true;
  }

  validateHex(hex: string): string {
    return (this.isValidHexaCode(hex)) ? hex : "#FFFFFF";
  }

  onShortHexChange() {
    this.onShortHexChange$$
      .pipe(
        debounceTime(500),
        filter((color: string) => this.isShortHex(color.length) && this.isValidHexaCode(color)),  // NOTE: Should be fine since it drops earlier values
        takeUntilDestroyed()
      )
      .subscribe((color: string) => {
        let hex: string = this.validateHex(color);
        this.hexcode.set(this.convertShortHexToLongForm(hex));
      })
  }

  isShortHex(length: number) {
    return length === 4;
  }

  onColorChange(value: string) {
    // If it's greater than 7, then we get rid of the rest of it and validate it
    value = this.clampHexInput(value);

    // We want to debounce this, if the user doesn't continue typing
    // We'll assume that they're done
    // Just always emit it because there'll be a filter for short hexes so it'll never pass through if it's already a long hex
    /****************** SHORTFORM **********************/
    this.onShortHexChange$$.next(value);

    // ***************************** LONGFORM *********************************** //

    // So now we actually validate the nature of the hex and actually set it
    if (!this.isShortHex(value.length) && this.isValidHexaCode(value))
      this.hexcode.set(value);
  }
  
  clampHexInput(value: string): string {
    value = value.substring(0, 7); 
    this.setHexInput(value);

    // NOTE: This might look strange, but it's a null value and therefore
    // The color just doesn't exist, that's how you set alpha to 0
    if (value.length <= 0) this.hexcode.set(value);

    return value;
  }

  convertShortHexToLongForm(hex: string): string {
    hex = hex.startsWith("#") ? hex.slice(1) : hex;

    if (hex.length === 3) {
      // Expand the short hex code (e.g., #abc to #aabbcc)
      let r: string = hex[0];
      let g: string = hex[1];
      let b: string = hex[2];

      return `#${r}${r}${g}${g}${b}${b}`;
    }
    else if (hex.length === 6) {
      return `#${hex}`;
    }
    else {
      throw new Error("Invalid hex code");
    }
  }
}
