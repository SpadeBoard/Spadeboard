import { ApplicationRef, ComponentRef, createComponent, EnvironmentInjector, inject, Injectable, inputBinding, outputBinding } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Style } from '../../../style/models/style';
import { EmbeddedExternalIframeComponent } from '../../../../utils/components/embedded-external-iframe/embedded-external-iframe.component';
import { setModalStyle } from '../../../../utils/utils';
import { closeModal, openModal } from '../../../../utils/modals.utils';

@Injectable({
  providedIn: 'root'
})
export class CardEditorInfoService {
  private infoUrlChange$$: Subject<string> = new Subject<string>();
  public readonly infoUrlChange$: Observable<string> = this.infoUrlChange$$.asObservable();

  private readonly environmentInjector: EnvironmentInjector = inject<EnvironmentInjector>(EnvironmentInjector);
  private readonly appRef: ApplicationRef = inject<ApplicationRef>(ApplicationRef);

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

    setModalStyle(host, style);

    // TODO: Modify for debugging purposes
    // console.log(`%c${logInfo(this.constructor.name, this.open.name)}\nactionContextMenuItems:\n${stringify(actionContextMenuItems)}`, 'color: #003844; background: #FFEBC6; padding: 5px; border-radius: 5px;');

    let ref: ComponentRef<EmbeddedExternalIframeComponent> = createComponent(EmbeddedExternalIframeComponent, {
      environmentInjector: this.environmentInjector,
      hostElement: host,
      bindings: [
        inputBinding('$websiteUrl', () => websiteUrl),
        outputBinding('$closed', () => {
          closeModal(this.appRef, {host, ref});
        })
      ]
    });

    openModal(this.appRef, {host, ref});

    return { host, ref }
  }
}
