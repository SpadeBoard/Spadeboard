import { ApplicationRef, ComponentRef, createComponent, EnvironmentInjector, inject, Injectable, inputBinding, outputBinding } from '@angular/core';
import { ActionContextMenuComponent } from '../components/action-context-menu/action-context-menu/action-context-menu.component';

@Injectable({
  providedIn: 'root'
})
export class ActionContextMenuService {
  private readonly environmentInjector: EnvironmentInjector = inject(EnvironmentInjector);
  private readonly appRef: ApplicationRef = inject(ApplicationRef);

  constructor() { }

  public open(message: string): void {
    // Create a host element for the popup
    let host: HTMLElement = document.createElement('action-context-menu-host');
    // Create the component and bind in one call
    let ref: ComponentRef<ActionContextMenuComponent> = createComponent(ActionContextMenuComponent, {
      environmentInjector: this.environmentInjector,
      hostElement: host,
      bindings: [
        outputBinding('closed', () => {
          document.body.removeChild(host);
          this.appRef.detachView(ref.hostView);
          ref.destroy();
        }),
      ],
    });
  }
}
