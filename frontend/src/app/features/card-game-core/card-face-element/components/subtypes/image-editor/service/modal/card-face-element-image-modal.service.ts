import { ApplicationRef, ComponentRef, createComponent, EnvironmentInjector, inject, Injectable, inputBinding } from '@angular/core';
import { CardFaceElementImageEditorComponent } from '../../component/card-face-element-image-editor.component';
import { Style } from '../../../../../../../style/models/style';
import { Image } from '../../../../../../../style/models/image';
import { DEFAULT_MODAL_STYLE } from '../../../../../../card-editor/constants/card-editor.constants';
import { closeModal, openModal } from '../../../../../../../../utils/modals.utils';
import { setModalStyle } from '../../../../../../../../utils/utils';

@Injectable({
  providedIn: 'root',
})
export class CardFaceElementImageModalService {
  private readonly environmentInjector: EnvironmentInjector = inject<EnvironmentInjector>(EnvironmentInjector);
  private readonly appRef: ApplicationRef = inject<ApplicationRef>(ApplicationRef);

  private cardFaceImageEditorInstance: {
    host: HTMLElement;
    ref: ComponentRef<CardFaceElementImageEditorComponent>;
  } | undefined;

  private cardFaceImageAttr: {
    cardFaceImage: Image;
    cardFaceImageStyle: Style;
  } = {
      cardFaceImage: {
        imageId: 0,
        src: '',
        alt: ''
      },
      cardFaceImageStyle: {
        styleId: "0",
        width: '100',
        height: '150',
      }
    };
    
  public displayCardFaceImageEditor(): void {
    if (!this.cardFaceImageEditorInstance) {
      this.cardFaceImageEditorInstance = this.open(this.cardFaceImageAttr, DEFAULT_MODAL_STYLE);
      return;
    }

    this.show(this.cardFaceImageEditorInstance, DEFAULT_MODAL_STYLE);
  }

  // FIXME: Wait, isn't this literally a circular reference?
  public open(
    cardFaceImageAttr: {
      cardFaceImage: Image;
      cardFaceImageStyle: Style;
    },
    style: Omit<Style, 'styleId'>,
  ): {
    host: HTMLElement;
    ref: ComponentRef<CardFaceElementImageEditorComponent>;
  } {
    let host: HTMLElement = document.createElement('card-face-image-editor-host');

    // TODO: Modify for debugging purposes
    // console.log(`%c${logInfo(this.constructor.name, this.open.name)}\nactionContextMenuItems:\n${stringify(actionContextMenuItems)}`, 'color: #003844; background: #FFEBC6; padding: 5px; border-radius: 5px;');

    let ref: ComponentRef<CardFaceElementImageEditorComponent> = createComponent(CardFaceElementImageEditorComponent, {
      environmentInjector: this.environmentInjector,
      hostElement: host,
      bindings: [
        inputBinding('$cardFaceImageAttr', () => cardFaceImageAttr)
      ],
    });

    this.show({ host, ref }, style);
    return { host, ref };
  }

  private show(
    cardFaceImageEditorInstance: {
      host: HTMLElement,
      ref: ComponentRef<CardFaceElementImageEditorComponent>;
    },
    style: Omit<Style, 'styleId'>
  ): {
    host: HTMLElement;
    ref: ComponentRef<CardFaceElementImageEditorComponent>;
  } {
    let { host, ref } = cardFaceImageEditorInstance;

    setModalStyle(host, style);
    openModal(this.appRef, cardFaceImageEditorInstance);

    return { host, ref };
  }

  public closeCardFaceImageEditor(): void {
    if (!this.cardFaceImageEditorInstance) return;

    closeModal(this.appRef, this.cardFaceImageEditorInstance, false);
  }
}
