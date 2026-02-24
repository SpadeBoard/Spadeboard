import { Component, input, InputSignal } from '@angular/core';

@Component({
  selector: 'app-label',
  imports: [],
  templateUrl: './label.component.html',
  styleUrl: './label.component.scss',
})
export class LabelComponent {
  public readonly $label: InputSignal<string> = input<string>('');

  public readonly $value: InputSignal<string> = input<string>('');
}
