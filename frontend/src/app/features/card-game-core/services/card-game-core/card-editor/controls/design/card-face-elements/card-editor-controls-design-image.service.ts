import { ApplicationRef, ComponentRef, createComponent, DestroyRef, EnvironmentInjector, inject, Injectable, inputBinding, outputBinding } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, merge, Observable, Subject, Subscription } from 'rxjs';
import { operate } from '../../../../../../../../utils/utils';
import { CardFaceImageEditorComponent } from '../../../../../../components/card-face-image-editor/card-face-image-editor.component';
import { Style } from '../../../../../../../style/models/style';
import { Image } from '../../../../../../../style/models/image';

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

    if (style.position) host.style.position = style.position;
    if (style.left) host.style.left = style.left;
    if (style.top) host.style.top = style.top;
    if (style.height) host.style.height = style.height;
    if (style.width) host.style.width = style.width;
    if (style.backgroundColor) host.style.backgroundColor = style.backgroundColor;
    if (style.borderRadius) host.style.borderRadius = style.borderRadius;
    if (style.padding) host.style.padding = style.padding;
    
    // TODO: Modify for debugging purposes
    // console.log(`%c${this.constructor.name} - ${this.open.name}\nactionContextMenuItems:\n${stringify(actionContextMenuItems)}`, 'color: #003844; background: #FFEBC6; padding: 5px; border-radius: 5px;');

    let ref: ComponentRef<CardFaceImageEditorComponent> = createComponent(CardFaceImageEditorComponent, {
      environmentInjector: this.environmentInjector,
      hostElement: host,
      bindings: [
        inputBinding('$cardFaceImageAttr', () => cardFaceImageAttr),
        outputBinding(
          '$closed', () => {
            document.body.removeChild(host);
            this.appRef.detachView(ref.hostView);
            ref.destroy();

            if (onClosed) onClosed();
          }
        )
      ],
    });

    // Registers the component’s view so it participates in change detection cycle.
    this.appRef.attachView(ref.hostView);
    // Inserts the provided host element into the DOM (outside the normal Angular view hierarchy).
    // This is what makes the popup visible on screen, typically used for overlays or modals.
    document.body.appendChild(host);
  }
}
