import { Component } from '@angular/core';

import { ActionContextMenuItem } from '../../models/action-context-menu-item';

@Component({
  selector: 'app-action-context-menu-item',
  imports: [],
  templateUrl: './action-context-menu-item.component.html',
  styleUrl: './action-context-menu-item.component.scss'
})
export class ActionContextMenuItemComponent {
  actionContextMenuItem: ActionContextMenuItem;

  constructor(newActionContextMenuItem: ActionContextMenuItem) {
    this.actionContextMenuItem = newActionContextMenuItem;
  }

  onClick(): void {
    this.actionContextMenuItem.action();
  }
}
