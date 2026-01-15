import { ApplicationRef, ComponentRef, createComponent, EnvironmentInjector, inject, Injectable, inputBinding, outputBinding } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Style } from '../../../../../style/models/style';
import { EmbeddedExternalIframeComponent } from '../../../../../../utils/components/embedded-external-iframe/embedded-external-iframe.component';
import { setHostElementStyle } from '../../../../../../utils/utils';

@Injectable({
  providedIn: 'root'
})
export class CardEditorInfoService {
  private infoUrlChange$$: Subject<string> = new Subject<string>();
  public readonly infoUrlChange$: Observable<string> = this.infoUrlChange$$.asObservable();

  private readonly environmentInjector: EnvironmentInjector = inject(EnvironmentInjector);
  private readonly appRef: ApplicationRef = inject(ApplicationRef);

  public setOnInfoUrlChange(url: string): void {
    this.infoUrlChange$$.next(url);
  }

  public openWiki(
    websiteUrl: string,
    style: Omit<Style, 'styleId'>,
  ): {
    host: HTMLElement,
    ref: ComponentRef<EmbeddedExternalIframeComponent>
  } {
    let host: HTMLElement = document.createElement('spadeboard-wiki-host');

    setHostElementStyle(host, style);

    // TODO: Modify for debugging purposes
    // console.log(`%c${this.constructor.name} - ${this.open.name}\nactionContextMenuItems:\n${stringify(actionContextMenuItems)}`, 'color: #003844; background: #FFEBC6; padding: 5px; border-radius: 5px;');

    let ref: ComponentRef<EmbeddedExternalIframeComponent> = createComponent(EmbeddedExternalIframeComponent, {
      environmentInjector: this.environmentInjector,
      hostElement: host,
      bindings: [
        inputBinding('$websiteUrl', () => websiteUrl),
        outputBinding('$closed', () => {
          this.closeWiki({
            host, ref
          })
        })
      ]
    });

    // Registers the component’s view so it participates in change detection cycle.
    this.appRef.attachView(ref.hostView);
    // Inserts the provided host element into the DOM (outside the normal Angular view hierarchy).
    // This is what makes the popup visible on screen, typically used for overlays or modals.
    document.body.appendChild(host);

    return { host, ref }
  }

  public closeWiki(instance: {
    host: HTMLElement,
    ref: ComponentRef<EmbeddedExternalIframeComponent>
  }): void {
    let { host, ref } = instance;

    document.body.removeChild(host);
    this.appRef.detachView(ref.hostView);
    ref.destroy();
  }
}
