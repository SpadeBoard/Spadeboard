import { ApplicationRef, ComponentRef, createComponent, EnvironmentInjector, inject, Injectable, inputBinding, outputBinding } from '@angular/core';
import { ActionContextMenuComponent } from '../components/action-context-menu/action-context-menu/action-context-menu.component';
import { ActionContextMenuItem } from '../models/action-context-menu-item';
import { Coordinates, stringify } from '../../../utils/utils';
import { Style } from '../../style/models/style';

@Injectable({
  providedIn: 'root'
})
export class ActionContextMenuService {
  private readonly environmentInjector: EnvironmentInjector = inject(EnvironmentInjector);
  private readonly appRef: ApplicationRef = inject(ApplicationRef);

  constructor() { }

  public getStyle(pos: Coordinates): Omit<Style, 'styleId'> {
    return {
      position: 'fixed',
      left: `${pos.x}px`,
      top: `${pos.y}px`,
    }
  }

  public open(actionContextMenuItems: ActionContextMenuItem[], performAction: (item: ActionContextMenuItem) => void, style: Omit<Style, 'styleId'>, onClosed?: () => void): void {
    let host: HTMLElement = document.createElement('action-context-menu-host');

    if (style.position) host.style.position = style.position;
    if (style.left) host.style.left = style.left;
    if (style.top) host.style.top = style.top;
    if (style.zIndex) host.style.zIndex = style.zIndex;

    console.log(`%c${this.constructor.name} - ${this.open.name} - actionContextMenuItems:\n${stringify(actionContextMenuItems)}`, 'color: #003844; background: #FFEBC6; padding: 5px; border-radius: 5px;') ;

    let ref: ComponentRef<ActionContextMenuComponent> = createComponent(ActionContextMenuComponent, {
      environmentInjector: this.environmentInjector,
      hostElement: host,
      bindings: [
        inputBinding('$actionContextMenuItems', () => actionContextMenuItems),
        outputBinding(
          '$closed', () => {
            document.body.removeChild(host);
            this.appRef.detachView(ref.hostView);
            ref.destroy();

            if (onClosed) onClosed();
          }
        ),
        outputBinding(
          '$onActionContextMenuItemClick', (item: ActionContextMenuItem) => {
            performAction(item);
          }
        ),
      ],
    });

    // Registers the component’s view so it participates in change detection cycle.
    this.appRef.attachView(ref.hostView);
    // Inserts the provided host element into the DOM (outside the normal Angular view hierarchy).
    // This is what makes the popup visible on screen, typically used for overlays or modals.
    document.body.appendChild(host);
  }
}
