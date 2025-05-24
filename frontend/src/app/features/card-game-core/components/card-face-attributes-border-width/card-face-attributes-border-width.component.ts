import { Component, model, ModelSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-card-face-attributes-border-width',
  imports: [FormsModule],
  templateUrl: './card-face-attributes-border-width.component.html',
  styleUrl: './card-face-attributes-border-width.component.css'
})
export class CardFaceAttributesBorderWidthComponent {
  borderWidth: ModelSignal<number> = model<number>(2);

  borderTopWidth: ModelSignal<number> = model<number>(2);
  borderBottomWidth: ModelSignal<number> = model<number>(2);
  borderLeftWidth: ModelSignal<number> = model<number>(2);
  borderRightWidth: ModelSignal<number> = model<number>(2);

  isMixed: boolean = false;

  shouldDropDown: boolean = false;

  onBorderWidthChange(value: number) {
    this.borderWidthValue = value;

    this.borderTopWidthValue = value;
    this.borderBottomWidthValue = value;
    this.borderLeftWidthValue = value;
    this.borderRightWidthValue = value;
  }

  get borderWidthValue() {
    return this.borderWidth();
  }

   set borderWidthValue(value: number) {
    this.borderWidth.set(value);
  }

  get borderTopWidthValue() {
    return this.borderTopWidth();
  }

   get borderBottomWidthValue() {
    return this.borderBottomWidth();
  }

   get borderLeftWidthValue() {
    return this.borderLeftWidth();
  }

   get borderRightWidthValue() {
    return this.borderRightWidth();
  }

  set borderTopWidthValue(value: number) {
    this.borderTopWidth.set(value);
  }

  set borderBottomWidthValue(value: number) {
    this.borderBottomWidth.set(value);
  }

  set borderLeftWidthValue(value: number) {
    this.borderLeftWidth.set(value);
  }

  set borderRightWidthValue(value: number) {
    this.borderRightWidth.set(value);
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
