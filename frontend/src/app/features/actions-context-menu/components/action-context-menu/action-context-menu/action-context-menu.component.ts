import { Component, input, InputSignal, output, OutputEmitterRef } from '@angular/core';
import { ActionContextMenuItem } from '../../../models/action-context-menu-item';

@Component({
  selector: 'app-action-context-menu',
  imports: [],
  templateUrl: './action-context-menu.component.html',
  styleUrl: './action-context-menu.component.scss'
})
export class ActionContextMenuComponent {
  // TODO: Loop through these items
  actionContextMenuItems: InputSignal<ActionContextMenuItem[] | undefined> = input<ActionContextMenuItem[]>();
  onActionContextMenuItemClick: OutputEmitterRef<ActionContextMenuItem> = output<ActionContextMenuItem>();
  
  constructor(){}

  onContextMenuItemClick(item: ActionContextMenuItem): void {
    this.onActionContextMenuItemClick.emit(item);
  }
}
