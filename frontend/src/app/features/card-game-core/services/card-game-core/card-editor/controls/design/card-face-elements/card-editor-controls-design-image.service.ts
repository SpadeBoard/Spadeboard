import { ApplicationRef, ComponentRef, createComponent, DestroyRef, EnvironmentInjector, inject, Injectable, inputBinding } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, merge, Observable, Subject, Subscription } from 'rxjs';
import { closeModal, openModal } from '../../../../../../../../utils/modals.utils';
import { operate, setModalStyle } from '../../../../../../../../utils/utils';
import { Image } from '../../../../../../../style/models/image';
import { Style } from '../../../../../../../style/models/style';
import { CardFaceImageEditorComponent } from '../../../../../../components/card-face-image-editor/card-face-image-editor.component';
import { DEFAULT_MODAL_STYLE } from '../../../../../../utils/card-editor.constants';

@Injectable({
  providedIn: 'root'
})
export class CardEditorControlsDesignImageService {
  private enableImageEditor$$: Subject<string> = new Subject<string>();
  public readonly enableImageEditor$: Observable<string> = this.enableImageEditor$$.asObservable();

  private uploadImage$$: Subject<string> = new Subject<string>();
  public readonly uploadImage$: Observable<string> = this.uploadImage$$.asObservable();

  private disableImageEditor$$: Subject<string> = new Subject<string>();
  public readonly disableImageEditor$: Observable<string> = this.disableImageEditor$$.asObservable();

  private readonly environmentInjector: EnvironmentInjector = inject(EnvironmentInjector);
  private readonly appRef: ApplicationRef = inject(ApplicationRef);

  private cardFaceImageEditorInstance: {
    host: HTMLElement;
    ref: ComponentRef<CardFaceImageEditorComponent>;
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

  constructor() { }

  public setOnEnableImageEditor(id: string): void {
    this.enableImageEditor$$.next(id);
  }

   public setUploadImage(src: string): void {
    this.uploadImage$$.next(src);
  }

  public setDisableImageEditor(src: string): void {
    this.disableImageEditor$$.next(src);
  }

  public onStatusToggle(imageEditorStatusOperations: Map<string, Function>, destroyRef: DestroyRef): Subscription {
    return merge(
      this.enableImageEditor$.pipe(
        map((id: string) => ({ operation: 'enable', emitted: id }))
      ),
      this.uploadImage$.pipe(
        map((src: string) => ({ operation: 'upload', emitted: src }))
      ),
      this.disableImageEditor$.pipe(
        map((src: string) => ({ operation: 'disable', emitted: src }))
      )
    )
      .pipe(
        takeUntilDestroyed(destroyRef)
      )
      .subscribe((result: ({ operation: string, emitted: string }) | string) => {
        operate(result, imageEditorStatusOperations);
      });
  }

  public displayCardFaceImageEditor(): void {
    if (!this.cardFaceImageEditorInstance) {
      this.cardFaceImageEditorInstance = this.open(this.cardFaceImageAttr, DEFAULT_MODAL_STYLE);
      return;
    }

    this.show(this.cardFaceImageEditorInstance, DEFAULT_MODAL_STYLE);
  }

  public open(
    cardFaceImageAttr: {
      cardFaceImage: Image;
      cardFaceImageStyle: Style;
    },
    style: Omit<Style, 'styleId'>,
  ): {
    host: HTMLElement;
    ref: ComponentRef<CardFaceImageEditorComponent>;
  } {
    let host: HTMLElement = document.createElement('card-face-image-editor-host');

    // TODO: Modify for debugging purposes
    // console.log(`%c${this.constructor.name} - ${this.open.name}\nactionContextMenuItems:\n${stringify(actionContextMenuItems)}`, 'color: #003844; background: #FFEBC6; padding: 5px; border-radius: 5px;');

    let ref: ComponentRef<CardFaceImageEditorComponent> = createComponent(CardFaceImageEditorComponent, {
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
      ref: ComponentRef<CardFaceImageEditorComponent>;
    },
    style: Omit<Style, 'styleId'>
  ): {
    host: HTMLElement;
    ref: ComponentRef<CardFaceImageEditorComponent>;
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
