import { Component, input, InputSignal, output, OutputEmitterRef } from '@angular/core';
import { Style } from '../../features/style/models/style';

@Component({
  selector: 'app-button',
  imports: [],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  public readonly $style: InputSignal<Omit<Style, 'styleId'>> = input<Omit<Style, 'styleId'>>({});
  
  public readonly $clicked: OutputEmitterRef<Event> = output<Event>();

  protected clicked(event: Event): void {
    this.$clicked.emit(event);
  }
}
