import { Component, input, InputSignal, model, ModelSignal } from '@angular/core';
import { StandardTextInputComponent } from '../standard/standard-text-input.component';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { DEBOUNCE_TIME } from '../../../../utils/debounce/debounce.constants';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { clamp } from '../../../../utils/utils';

@Component({
  selector: 'app-pair-text-input',
  imports: [
    StandardTextInputComponent
  ],
  templateUrl: './pair-text-input.component.html',
  styleUrl: './pair-text-input.component.scss',
})
export class PairTextInputComponent {
  public $a: ModelSignal<number> = model<number>(0);

  public $b: ModelSignal<number> = model<number>(0);

  public $labelA: InputSignal<string> = input<string>('');

  public $labelB: InputSignal<string> = input<string>('');
  
  public $minA: InputSignal<number> = input<number>(0);

  public $minB: InputSignal<number> = input<number>(0);

  public $maxA: InputSignal<number> = input<number>(100);

  public $maxB: InputSignal<number> = input<number>(100);

  private readonly value$$: Subject<{
    key: 'a' | 'b', 
    value: number
  }> = new Subject<{
    key: 'a' | 'b', 
    value: number
  }>();

  public readonly $disabled: InputSignal<boolean> = input<boolean>(false);

  constructor() {
    this.valueChange();
  }
  
  protected onValueChange(value: number, key: 'a' | 'b'): void {
    this.value$$.next({ key, value });
  }

  private valueChange(): Subscription {
    return this.value$$
      .pipe(
        debounceTime(DEBOUNCE_TIME),
        takeUntilDestroyed()
      )
      .subscribe((result: {
        key: "a" | "b";
        value: number;
      }) => {
        let {key, value} = result;
        switch (key) {
          case 'a':
            if (isNaN(value)) value = this.$minA();

            this.$a.set(clamp(value, this.$minA(), this.$maxA()));
            break;
          case 'b':
            if (isNaN(value)) value = this.$minB();

            this.$b.set(clamp(value, this.$minB(), this.$maxB()));
            break;
        }
      });
  }
}
