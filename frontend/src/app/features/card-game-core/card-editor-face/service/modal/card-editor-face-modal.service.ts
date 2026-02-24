import { ApplicationRef, ComponentRef, createComponent, EnvironmentInjector, inject, Injectable, inputBinding } from '@angular/core';
import { closeModal, openModal } from '../../../../../utils/modals.utils';
import { FileMetadata } from '../../../../../utils/models/file-metadata';
import { Coordinates, Dimensions, logInfo, setModalStyle, stringify } from '../../../../../utils/utils';
import { Style } from '../../../../style/models/style';
import { DEFAULT_MODAL_STYLE } from '../../../card-editor/constants/card-editor.constants';
import { CardEditorFaceComponent } from '../../components/core/card-editor-face.component';

@Injectable({
  providedIn: 'root',
})
export class CardEditorFaceModalService {
  private readonly environmentInjector: EnvironmentInjector = inject<EnvironmentInjector>(EnvironmentInjector);
  private readonly appRef: ApplicationRef = inject<ApplicationRef>(ApplicationRef);

  public orphanedFileMetadata: FileMetadata[] = [];

  public instances: Map<
    string,
    {
      host: HTMLElement,
      ref: ComponentRef<CardEditorFaceComponent>
    }> = new Map();

  public createCardEditorFaceInstance(
    cardEditorFaceStyle: Style,
    cardFaceElementIdentifiers: {
      cardFaceElementId: string,
      cardFaceElementType: 'Rt' | 'Image',
      cardFaceElementZIndex: string,
      cardFaceElementPerCardFaceId: string // TODO: Take this out
    }[],
    cardFaceElementPositions: Map<string, Coordinates>,
    cardFaceElementDimensions: Map<string, Dimensions>,
    cardFaceElementRts: Map<string, string>,
    cardFaceElementImages: Map<string, string>,
    canEdit: boolean = false
  ): string {
    let host: HTMLElement = document.createElement('card-editor-face-preview-host');

    let ref: ComponentRef<CardEditorFaceComponent> = createComponent(CardEditorFaceComponent, {
      environmentInjector: this.environmentInjector,
      hostElement: host,
      bindings: [
        inputBinding('$cardEditorFaceStyle', () => cardEditorFaceStyle),
        inputBinding('$cardFaceElementIdentifiers', () => cardFaceElementIdentifiers),
        inputBinding('$cardFaceElementPositions', () => cardFaceElementPositions),
        inputBinding('$cardFaceElementDimensions', () => cardFaceElementDimensions),
        inputBinding('$cardFaceElementRts', () => cardFaceElementRts),
        inputBinding('$cardFaceElementImages', () => cardFaceElementImages),
        inputBinding("$editable", () => canEdit)
      ]
    });

    setModalStyle(host, {
      ...DEFAULT_MODAL_STYLE,
      width: '90vw',
      height: '90vh',
      display: 'block',
      pointerEvents: 'none',
    });

    openModal(this.appRef, { host, ref });

    let id: string = crypto.randomUUID();
    this.instances.set(id, { host, ref });

    console.log(`%c${logInfo(this.constructor.name, this.createCardEditorFaceInstance.name)} Style:\n${stringify(cardEditorFaceStyle)}\nElements:\n${stringify(cardFaceElementIdentifiers)}`, 'color: #453643; background: #8DAA91; padding: 5px; border-radius: 5px;');

    return id;
  }

  public clearCardEditorFaceInstances(): void {
    this.instances.forEach((value: {
      host: HTMLElement,
      ref: ComponentRef<CardEditorFaceComponent>
    }) => {
      closeModal(this.appRef, value);
    });

    this.instances.clear();
  }
}
