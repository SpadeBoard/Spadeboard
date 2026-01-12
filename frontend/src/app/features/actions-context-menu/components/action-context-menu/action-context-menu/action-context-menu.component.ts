import { Component, ElementRef, HostListener, inject, input, InputSignal, output, OutputEmitterRef } from '@angular/core';
import { ActionContextMenuItem } from '../../../models/action-context-menu-item';

@Component({
  selector: 'app-action-context-menu',
  imports: [],
  templateUrl: './action-context-menu.component.html',
  styleUrl: './action-context-menu.component.scss'
})
export class ActionContextMenuComponent {
  // TODO: Loop through these items
  public readonly $actionContextMenuItems: InputSignal<ActionContextMenuItem[] | undefined> = input<ActionContextMenuItem[]>();
  public readonly $onActionContextMenuItemClick: OutputEmitterRef<ActionContextMenuItem> = output<ActionContextMenuItem>();
  
  protected readonly $closed: OutputEmitterRef<void> = output<void>();

  private readonly el: ElementRef<any> = inject(ElementRef);

  constructor(){}

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (!this.el.nativeElement.contains(event.target)) {
      this.$closed.emit();
    }
  }

  protected onContextMenuItemClick(item: ActionContextMenuItem): void {
    this.$onActionContextMenuItemClick.emit(item);
  }
}
