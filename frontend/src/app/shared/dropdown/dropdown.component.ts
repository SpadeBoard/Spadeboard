import { Component, input, InputSignal, model, ModelSignal } from '@angular/core';
import { Style } from '../../features/style/models/style';

@Component({
  selector: 'app-dropdown',
  imports: [],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.scss',
})
export class DropdownComponent {
  public readonly $shouldDropDown: ModelSignal<boolean> = model<boolean>(false);

  public readonly $dropdownStyle: InputSignal<Omit<Style, "styleId">> = input<Omit<Style, "styleId">>({
    'marginTop': '0.75rem',
    'backgroundColor': '#BFBEBE',
    'padding': '5%',
    'borderRadius': '10px'
  });

  protected onDropdownClick(event: Event): void {
    this.$shouldDropDown.set(!this.$shouldDropDown());
  }
}
