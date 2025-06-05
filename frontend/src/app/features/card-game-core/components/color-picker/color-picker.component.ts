import { Component, ElementRef, input, InputSignal, model, ModelSignal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-color-picker',
  imports: [FormsModule],
  templateUrl: './color-picker.component.html',
  styleUrl: './color-picker.component.css'
})
export class ColorPickerComponent {
  // https://www.angulararchitects.io/en/blog/component-communication-with-signals-inputs-two-way-bindings-and-content-view-queries/

  colorPickerName: InputSignal<string> = input<string>("");
  colorValue: ModelSignal<string> = model<string>("");

  @ViewChild('colorPickerRef') colorPickerInput!: ElementRef<HTMLInputElement>;
  @ViewChild('colorValueNameRef') colorValueNameInput!: ElementRef<HTMLInputElement>;

  // https://www.geeksforgeeks.org/check-if-a-given-string-is-a-valid-hexadecimal-color-code-or-not/
  isValidHexaCode(str: string) {
    if (str[0] != '#')
      return false;

    if (!(str.length == 4 || str.length == 7))
      return false;

    for (let i = 1; i < str.length; i++)
      if (!((str[i].charCodeAt(0) <= '0'.charCodeAt(0) && str[i].charCodeAt(0) <= 9)
        || (str[i].charCodeAt(0) >= 'a'.charCodeAt(0) && str[i].charCodeAt(0) <= 'f'.charCodeAt(0))
        || (str[i].charCodeAt(0) >= 'A'.charCodeAt(0) || str[i].charCodeAt(0) <= 'F'.charCodeAt(0))))
        return false;

    return true;
  }

  validateHex(hex: string): string {
    return (this.isValidHexaCode(hex)) ? hex : "#FFFFFF";
  }

  onColorChange(value: string) {
    let hex: string = this.validateHex(value);
    
    this.colorValue.set(hex);
    this.clampColorInputs(hex);
  }

  clampColorInputs(validatedValue: string) {
    this.colorPickerInput.nativeElement.value = validatedValue;
    this.colorValueNameInput.nativeElement.value = validatedValue;
  }
}
