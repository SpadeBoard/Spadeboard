import { ApplicationRef, ComponentRef, createComponent, DestroyRef, EnvironmentInjector, inject, Injectable, inputBinding, outputBinding } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, merge, Observable, Subject, Subscription } from 'rxjs';
import { operate, setModalStyle } from '../../../../../../../../utils/utils';
import { CardFaceImageEditorComponent } from '../../../../../../components/card-face-image-editor/card-face-image-editor.component';
import { Style } from '../../../../../../../style/models/style';
import { Image } from '../../../../../../../style/models/image';
import { closeModal, openModal } from '../../../../../../../../utils/modals.utils';

@Injectable({
  providedIn: 'root'
})
export class CardEditorControlsDesignImageService {
  private enableImageEditor$$: Subject<string> = new Subject<string>();
  public readonly enableImageEditor$: Observable<string> = this.enableImageEditor$$.asObservable();

  private disableImageEditor$$: Subject<string> = new Subject<string>();
  public readonly disableImageEditor$: Observable<string> = this.disableImageEditor$$.asObservable();

  private readonly environmentInjector: EnvironmentInjector = inject(EnvironmentInjector);
  private readonly appRef: ApplicationRef = inject(ApplicationRef);

  constructor() { }

  public setOnEnableImageEditor(id: string): void {
    this.enableImageEditor$$.next(id);
  }

  public setDisableImageEditor(src: string): void {
    this.disableImageEditor$$.next(src);
  }

  public onStatusToggle(imageEditorStatusOperations: Map<string, Function>, destroyRef: DestroyRef): Subscription {
    return merge(
      this.enableImageEditor$.pipe(
        map((id: string) => ({ operation: 'enable', emitted: id }))
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

  public open(
    cardFaceImageAttr: {
      cardFaceImage: Image;
      cardFaceImageStyle: Style;
    },
    style: Omit<Style, 'styleId'>,
    onClosed?: () => void,
  ): void {
    let host: HTMLElement = document.createElement('card-face-image-editor-host');

   setModalStyle(host, style);

    // TODO: Modify for debugging purposes
    // console.log(`%c${this.constructor.name} - ${this.open.name}\nactionContextMenuItems:\n${stringify(actionContextMenuItems)}`, 'color: #003844; background: #FFEBC6; padding: 5px; border-radius: 5px;');

    let ref: ComponentRef<CardFaceImageEditorComponent> = createComponent(CardFaceImageEditorComponent, {
      environmentInjector: this.environmentInjector,
      hostElement: host,
      bindings: [
        inputBinding('$cardFaceImageAttr', () => cardFaceImageAttr),
        outputBinding(
          '$closed', () => {
            closeModal(this.appRef, { host, ref });

            if (onClosed) onClosed();
          }
        )
      ],
    });

    openModal(this.appRef, { host, ref });
  }
}
