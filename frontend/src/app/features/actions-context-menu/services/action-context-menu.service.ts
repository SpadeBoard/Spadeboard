import { ApplicationRef, ComponentRef, createComponent, EnvironmentInjector, inject, Injectable, inputBinding, outputBinding } from '@angular/core';
import { ActionContextMenuComponent } from '../components/action-context-menu/action-context-menu/action-context-menu.component';
import { ActionContextMenuItem } from '../models/action-context-menu-item';
import { Coordinates, setHostElementStyle, stringify } from '../../../utils/utils';
import { Style } from '../../style/models/style';

@Injectable({
  providedIn: 'root'
})
export class ActionContextMenuService {
  private readonly environmentInjector: EnvironmentInjector = inject(EnvironmentInjector);
  private readonly appRef: ApplicationRef = inject(ApplicationRef);

  private instances: Map<
  string, 
  {
    host: HTMLElement,
    ref: ComponentRef<ActionContextMenuComponent>
  }> = new Map();

  constructor() { }

  public getStyle(pos: Coordinates): Omit<Style, 'styleId'> {
    return {
      position: 'fixed',
      left: `${pos.x}px`,
      top: `${pos.y}px`,
    }
  }

  public open(
    actionContextMenuItems: ActionContextMenuItem[], 
    performAction: (item: ActionContextMenuItem) => void, 
    style: Omit<Style, 'styleId'>, 
    onClosed?: () => void, 
    shouldCloseOnPerformActions: boolean = true
  ): string {
    let host: HTMLElement = document.createElement('action-context-menu-host');

    if (style.position) host.style.position = style.position;
    if (style.left) host.style.left = style.left;
    if (style.top) host.style.top = style.top;
    if (style.zIndex) host.style.zIndex = style.zIndex;

    let uuid: string = crypto.randomUUID();

    console.log(`%c${this.constructor.name} - ${this.open.name} - UUID:${uuid}\nactionContextMenuItems:\n${stringify(actionContextMenuItems)}`, 'color: #003844; background: #FFEBC6; padding: 5px; border-radius: 5px;') ;

    let ref: ComponentRef<ActionContextMenuComponent> = createComponent(ActionContextMenuComponent, {
      environmentInjector: this.environmentInjector,
      hostElement: host,
      bindings: [
        outputBinding(
          '$closed', () => {
            document.body.removeChild(host);
            this.appRef.detachView(ref.hostView);
            ref.destroy();

            this.instances.delete(uuid);

            if (onClosed) onClosed();
          }
        ),
        outputBinding(
          '$onActionContextMenuItemClick', (item: ActionContextMenuItem) => {
            performAction(item);

            if (shouldCloseOnPerformActions) ref.instance.$closed.emit();
          }
        ),
      ],
    });

    // NOTE: Can't use inputBinding because setInput doesn't work with those as those are setup helpers, not dynamic reactive
    ref.setInput('$actionContextMenuItems', actionContextMenuItems);

    // Registers the component’s view so it participates in change detection cycle.
    this.appRef.attachView(ref.hostView);
    // Inserts the provided host element into the DOM (outside the normal Angular view hierarchy).
    // This is what makes the popup visible on screen, typically used for overlays or modals.
    document.body.appendChild(host);

    this.instances.set(uuid, {host, ref});

    return uuid;
  }

  public setActionContextMenuItems(
    id: string,
    actionContextMenuItems: ActionContextMenuItem[], 
  ): void {
     let instance: {host: HTMLElement, ref: ComponentRef<ActionContextMenuComponent>} | undefined = this.instances.get(id);
  
    if (!instance) throw new Error(`${this.constructor.name} - ${this.setActionContextMenuItems.name}: No instance per Id`);

    let {ref} = instance;

    ref.setInput('$actionContextMenuItems', actionContextMenuItems);
  }

  public setStyle(
    id: string,
    style: Omit<Style, 'styleId'>
  ): void {
    let instance: {host: HTMLElement, ref: ComponentRef<ActionContextMenuComponent>} | undefined = this.instances.get(id);
  
    if (!instance) throw new Error(`${this.constructor.name} - ${this.setStyle.name}: No instanceper Id`);

    let {host} = instance;

    setHostElementStyle(host, style);
  }

  public toggleActionContextMenu(shouldShowContextMenu: boolean): boolean {
    return !shouldShowContextMenu;
  }
}