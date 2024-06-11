import { Component, input } from '@angular/core';
import { ActionContextMenuItem } from '../../../models/action-context-menu-item';

@Component({
  selector: 'app-action-context-menu',
  imports: [],
  templateUrl: './action-context-menu.component.html',
  styleUrl: './action-context-menu.component.css'
})
export class ActionContextMenuComponent {
  // TODO: Loop through these items
  readonly actionContextMenuItems = input<ActionContextMenuItem[]>();

  constructor(){}
}
