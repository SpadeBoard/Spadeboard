import { ApplicationRef, ComponentRef, createComponent, EnvironmentInjector, inject, Injectable, inputBinding, outputBinding, signal, WritableSignal } from '@angular/core';
import { CardEditorComponent } from '../../components/core/card-editor.component';
import { closeModal, openModal } from '../../../../../utils/modals.utils';
import { Style } from '../../../../style/models/style';
import { setModalStyle } from '../../../../../utils/utils';
import { DEFAULT_MODAL_STYLE } from '../../constants/card-editor.constants';

@Injectable({
  providedIn: 'root',
})
export class CardEditorModalService {
  private readonly environmentInjector: EnvironmentInjector = inject<EnvironmentInjector>(EnvironmentInjector);
  private readonly appRef: ApplicationRef = inject<ApplicationRef>(ApplicationRef);

  public $isCardEditorOpen: WritableSignal<boolean> = signal<boolean>(false);

  private cardEditorInstance: {
    host: HTMLElement;
    ref: ComponentRef<CardEditorComponent>;
  } | undefined;

   public setIsCardEditorOpen(isCardEditorOpen: boolean): void {
    this.$isCardEditorOpen.set(isCardEditorOpen);
  }

  public toggleCardEditor(isCardEditorOpen: boolean): void {
    this.setIsCardEditorOpen(isCardEditorOpen);

    if (!this.$isCardEditorOpen()) {
      this.closeCardEditor();
      return;
    }

    let style: Omit<Style, 'styleId'> = {
      ...DEFAULT_MODAL_STYLE,
      overflow: 'scroll'
    }

    if (!this.cardEditorInstance) {
      this.cardEditorInstance = this.openCardEditor(style);
      return;
    }

    this.showCardEditor(this.cardEditorInstance, style);
  }

  private showCardEditor(
    cardEditorInstance: {
      host: HTMLElement,
      ref: ComponentRef<CardEditorComponent>;
    },
    style: Omit<Style, 'styleId'>
  ): {
    host: HTMLElement;
    ref: ComponentRef<CardEditorComponent>;
  } {
    if (!cardEditorInstance) {
      throw new Error('cardEditorInstance is not initialized');
    }

    let { host, ref } = cardEditorInstance;

    setModalStyle(host, style);

    openModal(this.appRef, cardEditorInstance);

    return { host, ref };
  }

  public openCardEditor(
    style: Omit<Style, 'styleId'>,
  ): {
    host: HTMLElement,
    ref: ComponentRef<CardEditorComponent>
  } {
    let host: HTMLElement = document.createElement('card-editor-preview-host');

    let ref: ComponentRef<CardEditorComponent> = createComponent(CardEditorComponent, {
      environmentInjector: this.environmentInjector,
      hostElement: host,
      bindings: [
        inputBinding('$editable', () => true), // TODO: Change true to be an argument
        outputBinding('$handleClose', () => {
          this.toggleCardEditor(!this.$isCardEditorOpen());
        })
      ]
    });

    return this.showCardEditor({ host, ref }, style);
  }

  public closeCardEditor(): void {
    if (!this.cardEditorInstance) return;

    closeModal(this.appRef, this.cardEditorInstance, false);
  }
}
