import { Directive, input, InputSignal, model, ModelSignal } from '@angular/core';
import { DEBOUNCE_TIME } from './debounce.constants';

@Directive({
  selector: '[appDebounce]',
  host: {
    '[value]': '$value()',
    '(input)': 'handleInput($event)',
  },
})
export class DebounceDirective {
  private debounceTimer?: ReturnType<typeof setTimeout>;

  public readonly $debounceTime: InputSignal<number> = input<number>(DEBOUNCE_TIME);

  public readonly $value: ModelSignal<string> = model<string>('');

  public handleInput(event: Event): void {
    clearTimeout(this.debounceTimer);
    
    let input: HTMLInputElement = event.target as HTMLInputElement;

    if (!input.value || !this.$debounceTime()) {
      this.$value.set(input.value);
    } else {
      this.debounceTimer = setTimeout(
        () => this.$value.set(input.value),
        this.$debounceTime()
      );
    }
  }
}
