import { Component, input, InputSignal, model, ModelSignal } from '@angular/core';
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

  get colorValueName(): string {
    return this.colorValue();
  }

  onColorChange(event: Event) {
    this.colorValue.set((event.target as HTMLInputElement).value);
  }
}
