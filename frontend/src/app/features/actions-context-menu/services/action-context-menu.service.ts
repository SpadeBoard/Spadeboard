import { ApplicationRef, ComponentRef, createComponent, EnvironmentInjector, inject, Injectable, inputBinding, outputBinding } from '@angular/core';
import { ActionContextMenuComponent } from '../components/action-context-menu/action-context-menu/action-context-menu.component';
import { ActionContextMenuItem } from '../models/action-context-menu-item';
import { Coordinates, setModalStyle, stringify } from '../../../utils/utils';
import { Style } from '../../style/models/style';
import { closeModal, openModal } from '../../../utils/modals.utils';

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
            closeModal(this.appRef, {host, ref});

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

    openModal(this.appRef, {host, ref});

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

    setModalStyle(host, style);
  }

  public toggleActionContextMenu(shouldShowContextMenu: boolean): boolean {
    return !shouldShowContextMenu;
  }
}