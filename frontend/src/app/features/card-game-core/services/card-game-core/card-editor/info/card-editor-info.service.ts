import { ApplicationRef, ComponentRef, createComponent, EnvironmentInjector, inject, Injectable, inputBinding, outputBinding } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Style } from '../../../../../style/models/style';
import { EmbeddedExternalIframeComponent } from '../../../../../../utils/components/embedded-external-iframe/embedded-external-iframe.component';

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

  public getStyle(): Omit<Style, 'styleId'> {
    return {
      position: 'fixed',
      top: '5%',
      left: '5%',
      height: `90vh`,
      width: `90vw`,
      borderRadius: '15px',
      backgroundColor: `#e7e7e6`,
      padding: '1%'
    }
  }

  public openWiki(
    websiteUrl: string,
    style: Omit<Style, 'styleId'>,
  ): {
    host: HTMLElement,
    ref: ComponentRef<EmbeddedExternalIframeComponent>
  } {
    let host: HTMLElement = document.createElement('card-face-image-editor-host');

    this.setWikiStyle(host, style);

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

  private setWikiStyle(host: HTMLElement, style: Omit<Style, 'styleId'>) {
    if (style.position) host.style.position = style.position;
    if (style.left) host.style.left = style.left;
    if (style.top) host.style.top = style.top;
    if (style.height) host.style.height = style.height;
    if (style.width) host.style.width = style.width;
    if (style.borderRadius) host.style.borderRadius = style.borderRadius;
    if (style.padding) host.style.padding = style.padding;
    if (style.backgroundColor) host.style.backgroundColor = style.backgroundColor;
  }

  public closeWiki(instance: {
    host: HTMLElement,
    ref: ComponentRef<EmbeddedExternalIframeComponent>
  }): void {
    let {host, ref} = instance;

    document.body.removeChild(host);
    this.appRef.detachView(ref.hostView);
    ref.destroy();
  }
}
