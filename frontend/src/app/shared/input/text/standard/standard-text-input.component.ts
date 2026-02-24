import { Component, input, InputSignal, model, ModelSignal, output, OutputEmitterRef } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-standard-text-input',
  imports: [FormsModule],
  templateUrl: './standard-text-input.component.html',
  styleUrl: './standard-text-input.component.scss',
})
export class StandardTextInputComponent {
  public readonly $label: InputSignal<string> = input<string>('Placeholder');

  public readonly $type: InputSignal<string> = input<string>('number');

  public $input: ModelSignal<any> = model<any>();

  public readonly $inputChanged: OutputEmitterRef<any> = output<any>();

  public readonly $disabled: InputSignal<boolean> = input<boolean>(false);
  
  protected onInputChange(event: Event): void {
    this.$inputChanged.emit(event);
  }
}
